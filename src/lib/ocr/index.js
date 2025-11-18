/**
 * OCR module using ONNX Runtime WebAssembly and Paddle Lite WebAssembly
 * Implements PaddleOCR recognition with CTC decoding
 * Supports both ONNX (.onnx) and Paddle Lite (.nb) model formats
 */

import { getModelConfig, MODEL_TYPES } from './models-config.js';
import { 
    isPaddleLiteAvailable, 
    loadPaddleLiteModel, 
    runPaddleLiteInference,
    extractPaddleLiteOutput,
    disposePaddleLiteModel 
} from './paddle-lite.js';

/**
 * Load character dictionary from file
 * @param {string} dictionaryPath - Path to dictionary file
 * @returns {Promise<string[]>} Array of characters (index 0 is blank, index 1+ are dictionary characters)
 */
export async function loadCharacterDictionary(dictionaryPath = 'static/models/ppocr_keys_v1.txt') {
    try {
        const response = await fetch(dictionaryPath);
        const text = await response.text();
        
        // Split by lines and filter empty lines
        const characters = text.split('\n').filter(line => line.length > 0);
        
        // Add blank token at index 0
        return ['<blank>', ...characters];
    } catch (error) {
        console.error('Error loading character dictionary:', error);
        throw error;
    }
}

/**
 * Load model (ONNX or Paddle Lite)
 * @param {string} modelId - Model identifier from models-config.js
 * @returns {Promise<Object>} Loaded model with type information
 */
export async function loadModel(modelId) {
    try {
        const config = getModelConfig(modelId);
        if (!config) {
            throw new Error(`Model config not found for: ${modelId}`);
        }
        
        const modelType = config.modelType || MODEL_TYPES.ONNX;
        
        if (modelType === MODEL_TYPES.PADDLE_LITE) {
            // Load Paddle Lite model
            if (!isPaddleLiteAvailable()) {
                console.warn('Paddle Lite not available, falling back to ONNX if possible');
                throw new Error('Paddle Lite WebAssembly is not loaded. Please include paddle.js library.');
            }
            
            const model = await loadPaddleLiteModel(config.modelPath);
            console.log(`Paddle Lite model ${config.name} loaded successfully from ${config.modelPath}`);
            
            return {
                ...model,
                modelType: MODEL_TYPES.PADDLE_LITE,
                config: config
            };
        } else {
            // Load ONNX model (default)
            const model = await ort.InferenceSession.create(config.modelPath, {
                executionProviders: ['wasm'],
            });
            
            console.log(`ONNX model ${config.name} loaded successfully from ${config.modelPath}`);
            
            return {
                session: model,
                modelType: MODEL_TYPES.ONNX,
                config: config
            };
        }
    } catch (error) {
        console.error('Error loading model:', error);
        throw error;
    }
}

/**
 * Load ONNX models (legacy function for backward compatibility)
 * @returns {Promise<{recModel: InferenceSession}>} Loaded models
 */
export async function loadModels() {
    try {
        // Load default recognition model
        const recModel = await ort.InferenceSession.create('static/models/rec_model.onnx', {
            executionProviders: ['wasm'],
        });
        
        console.log('Recognition model loaded successfully');
        
        return { recModel };
    } catch (error) {
        console.error('Error loading models:', error);
        throw error;
    }
}

/**
 * Perform OCR recognition on preprocessed image tensor
 * Supports both ONNX Runtime and Paddle Lite models
 * @param {Object} model - Model object (ONNX or Paddle Lite)
 * @param {Float32Array} inputTensor - Preprocessed image tensor [1, 3, 48, 320]
 * @param {string[]} dictionary - Character dictionary
 * @returns {Promise<string>} Recognized text
 */
export async function recognizeText(model, inputTensor, dictionary) {
    try {
        let outputData, outputShape;
        
        // Check model type and run appropriate inference
        if (model.modelType === MODEL_TYPES.PADDLE_LITE) {
            // Paddle Lite inference
            const result = await runPaddleLiteInference(model, inputTensor, model.config);
            const output = extractPaddleLiteOutput(result);
            outputData = output.data;
            outputShape = output.dims;
        } else {
            // ONNX Runtime inference (default)
            const session = model.session || model; // Support both new and legacy formats
            
            // Create input tensor
            const tensor = new ort.Tensor('float32', inputTensor, [1, 3, 48, 320]);
            
            // Run inference
            const feeds = { x: tensor };
            const results = await session.run(feeds);
            
            // Get output tensor
            const output = results[Object.keys(results)[0]];
            outputData = output.data;
            outputShape = output.dims;
        }
        
        // Output shape should be [1, 40, 6625] (1 batch, 40 time steps, 6625 classes including blank)
        const batchSize = outputShape[0];
        const timeSteps = outputShape[1];
        const numClasses = outputShape[2];
        
        // Extract class indices using argmax
        const classIndices = [];
        for (let t = 0; t < timeSteps; t++) {
            let maxIdx = 0;
            let maxVal = outputData[t * numClasses];
            
            for (let c = 1; c < numClasses; c++) {
                const val = outputData[t * numClasses + c];
                if (val > maxVal) {
                    maxVal = val;
                    maxIdx = c;
                }
            }
            
            classIndices.push(maxIdx);
        }
        
        // CTC decode
        const text = ctcDecode(classIndices, dictionary);
        
        return text;
    } catch (error) {
        console.error('Error during recognition:', error);
        throw error;
    }
}

/**
 * CTC decoding algorithm
 * Removes blank tokens and consecutive duplicates
 * @param {number[]} classIndices - Array of predicted class indices
 * @param {string[]} dictionary - Character dictionary
 * @returns {string} Decoded text
 */
function ctcDecode(classIndices, dictionary) {
    const decodedChars = [];
    let previousIndex = -1;
    
    for (const currentIndex of classIndices) {
        // Skip blank tokens (index 0)
        if (currentIndex === 0) {
            previousIndex = currentIndex;
            continue;
        }
        
        // Skip consecutive duplicates
        if (currentIndex === previousIndex) {
            previousIndex = currentIndex;
            continue;
        }
        
        // Map valid indices to characters
        if (currentIndex >= 1 && currentIndex < dictionary.length) {
            decodedChars.push(dictionary[currentIndex]);
        }
        
        previousIndex = currentIndex;
    }
    
    return decodedChars.join('');
}

/**
 * Calculate character-level accuracy between OCR result and ground truth
 * @param {string} ocrText - OCR recognized text
 * @param {string} groundTruth - Ground truth text
 * @returns {Object} Accuracy metrics
 */
export function calculateAccuracy(ocrText, groundTruth) {
    if (!groundTruth) {
        return {
            accuracy: 0,
            correct: 0,
            total: 0,
            identical: false
        };
    }
    
    const ocrChars = Array.from(ocrText);
    const gtChars = Array.from(groundTruth);
    
    // Calculate Levenshtein distance for character-level accuracy
    const distance = levenshteinDistance(ocrChars, gtChars);
    const maxLength = Math.max(ocrChars.length, gtChars.length);
    
    const accuracy = maxLength > 0 ? ((maxLength - distance) / maxLength) * 100 : 0;
    
    return {
        accuracy: accuracy.toFixed(2),
        correct: maxLength - distance,
        total: maxLength,
        identical: ocrText === groundTruth,
        distance: distance
    };
}

/**
 * Calculate Levenshtein distance between two arrays
 * @param {Array} a - First array
 * @param {Array} b - Second array
 * @returns {number} Edit distance
 */
function levenshteinDistance(a, b) {
    const matrix = [];
    
    // Initialize matrix
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    
    // Fill matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b[i - 1] === a[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }
    
    return matrix[b.length][a.length];
}
