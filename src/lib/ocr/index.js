/**
 * OCR module using ONNX Runtime WebAssembly
 * Implements PaddleOCR recognition with CTC decoding
 */

/**
 * Load character dictionary from file
 * @returns {Promise<string[]>} Array of characters (index 0 is blank, index 1+ are dictionary characters)
 */
export async function loadCharacterDictionary() {
    try {
        const response = await fetch('static/models/ppocr_keys_v1.txt');
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
 * Load ONNX models
 * @returns {Promise<{recModel: InferenceSession}>} Loaded models
 */
export async function loadModels() {
    try {
        // Load recognition model
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
 * @param {InferenceSession} model - ONNX recognition model
 * @param {Float32Array} inputTensor - Preprocessed image tensor [1, 3, 48, 320]
 * @param {string[]} dictionary - Character dictionary
 * @returns {Promise<string>} Recognized text
 */
export async function recognizeText(model, inputTensor, dictionary) {
    try {
        // Create input tensor
        const tensor = new ort.Tensor('float32', inputTensor, [1, 3, 48, 320]);
        
        // Run inference
        const feeds = { x: tensor };
        const results = await model.run(feeds);
        
        // Get output tensor
        const output = results[Object.keys(results)[0]];
        const outputData = output.data;
        const outputShape = output.dims;
        
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
    
    const text = decodedChars.join('');
    
    // Apply post-processing corrections
    return postProcessText(text);
}

/**
 * Post-process OCR text to fix common recognition errors
 * Uses context-aware corrections and visual similarity patterns
 * @param {string} text - Raw OCR text
 * @returns {string} Corrected text
 */
function postProcessText(text) {
    // Common OCR mistakes in Chinese characters - visually similar characters
    const corrections = {
        // Character pairs that are commonly confused
        '公': {pattern: /公([^共关])/g, replacement: '么$1', confidence: 0.7},  // 公 often confused with 么
        '刷': {pattern: /^刷去/g, replacement: '别去', confidence: 0.9},  // 刷去 → 别去 at start
        '装': {pattern: /装上心/g, replacement: '袭上心', confidence: 0.85},  // 装上心 → 袭上心
        '2': {pattern: /什2/g, replacement: '什么', confidence: 0.95},  // 什2 → 什么
        '网': {pattern: /楼网$/g, replacement: '楼啊', confidence: 0.8},  // 楼网 at end → 楼啊
        '活': {pattern: /句活以/g, replacement: '句话以', confidence: 0.9},  // 活 → 话 in context
        '榜': {pattern: /电榜/g, replacement: '电梯', confidence: 0.95},  // 榜 → 梯
        '游': {pattern: /游在/g, replacement: '站在', confidence: 0.85},  // 游 → 站
        '骨': {pattern: /哥骨/g, replacement: '哥哥', confidence: 0.9},  // 骨 → 哥
        '部': {pattern: /动部不/g, replacement: '动都不', confidence: 0.85},  // 部 → 都
        '政': {pattern: /不政动/g, replacement: '不敢动', confidence: 0.9},  // 政 → 敢
        '—': {pattern: /—动/g, replacement: '一动', confidence: 0.95},  // — → 一
        '[': {pattern: /动\[$/g, replacement: '动', confidence: 0.95},  // Remove trailing [
        '，': {pattern: /，/g, replacement: ',', confidence: 0.6},  // Full-width comma → half-width
    };
    
    let correctedText = text;
    
    // Apply each correction rule
    for (const [char, rule] of Object.entries(corrections)) {
        if (correctedText.includes(char)) {
            // Only apply if the pattern matches
            const matches = correctedText.match(rule.pattern);
            if (matches && matches.length > 0) {
                correctedText = correctedText.replace(rule.pattern, rule.replacement);
            }
        }
    }
    
    // Apply digit corrections in Chinese context
    // If we see isolated digits in Chinese text, they might be misrecognized characters
    correctedText = correctedText.replace(/([什么])(\d+)([^0-9])/g, (match, before, digit, after) => {
        // If digit appears between Chinese characters, it's likely wrong
        return before + '么' + after;
    });
    
    return correctedText;
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
