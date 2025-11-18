/**
 * Paddle Lite WebAssembly integration module
 * Provides support for loading and running .nb model files
 */

/**
 * Check if Paddle Lite WebAssembly is available
 * @returns {boolean} True if Paddle Lite is loaded
 */
export function isPaddleLiteAvailable() {
    return typeof paddlejs !== 'undefined' && paddlejs !== null;
}

/**
 * Load Paddle Lite model (.nb file)
 * @param {string} modelPath - Path to .nb model file
 * @returns {Promise<Object>} Loaded Paddle Lite model
 */
export async function loadPaddleLiteModel(modelPath) {
    if (!isPaddleLiteAvailable()) {
        throw new Error('Paddle Lite WebAssembly is not available. Please include paddle.js library.');
    }
    
    try {
        console.log(`Loading Paddle Lite model from ${modelPath}...`);
        
        // Initialize Paddle Lite runner
        const runner = await paddlejs.runner.load({
            modelPath: modelPath,
            feedShape: {
                fw: 320,
                fh: 48
            },
            fill: '#fff',
            mean: [0.5, 0.5, 0.5],
            std: [0.5, 0.5, 0.5]
        });
        
        console.log('Paddle Lite model loaded successfully');
        
        return {
            runner: runner,
            modelType: 'paddle_lite',
            modelPath: modelPath
        };
    } catch (error) {
        console.error('Error loading Paddle Lite model:', error);
        throw error;
    }
}

/**
 * Run inference with Paddle Lite model
 * @param {Object} model - Paddle Lite model object
 * @param {Float32Array} inputTensor - Preprocessed image tensor
 * @param {Object} config - Model configuration
 * @returns {Promise<Float32Array>} Model output
 */
export async function runPaddleLiteInference(model, inputTensor, config) {
    try {
        const { runner } = model;
        const { inputShape } = config;
        
        // Reshape input tensor for Paddle Lite
        // Paddle Lite expects NHWC format, but we have NCHW
        const nhwcTensor = nchwToNhwc(inputTensor, inputShape.height, inputShape.width);
        
        // Run inference
        const result = await runner.predict(nhwcTensor);
        
        return result;
    } catch (error) {
        console.error('Error during Paddle Lite inference:', error);
        throw error;
    }
}

/**
 * Convert tensor from NCHW to NHWC format
 * @param {Float32Array} nchwTensor - Input tensor in NCHW format [1, 3, H, W]
 * @param {number} height - Image height
 * @param {number} width - Image width
 * @returns {Float32Array} Tensor in NHWC format [1, H, W, 3]
 */
function nchwToNhwc(nchwTensor, height, width) {
    const nhwcTensor = new Float32Array(nchwTensor.length);
    
    for (let h = 0; h < height; h++) {
        for (let w = 0; w < width; w++) {
            const nhwcIdx = h * width * 3 + w * 3;
            const hwIdx = h * width + w;
            
            // R channel
            nhwcTensor[nhwcIdx] = nchwTensor[hwIdx];
            // G channel
            nhwcTensor[nhwcIdx + 1] = nchwTensor[height * width + hwIdx];
            // B channel
            nhwcTensor[nhwcIdx + 2] = nchwTensor[2 * height * width + hwIdx];
        }
    }
    
    return nhwcTensor;
}

/**
 * Extract output from Paddle Lite result
 * @param {Object} result - Paddle Lite inference result
 * @returns {Object} Formatted output with data and shape
 */
export function extractPaddleLiteOutput(result) {
    // Paddle Lite output format may vary
    // This is a generic implementation that should be adjusted based on actual output format
    if (Array.isArray(result)) {
        return {
            data: new Float32Array(result.flat()),
            dims: inferOutputShape(result)
        };
    } else if (result.data && result.shape) {
        return {
            data: result.data,
            dims: result.shape
        };
    } else {
        console.warn('Unknown Paddle Lite output format:', result);
        return {
            data: result,
            dims: [1, 40, 6625] // Default expected shape
        };
    }
}

/**
 * Infer output shape from nested array
 * @param {Array} arr - Nested array
 * @returns {Array} Shape dimensions
 */
function inferOutputShape(arr) {
    const shape = [];
    let current = arr;
    
    while (Array.isArray(current)) {
        shape.push(current.length);
        current = current[0];
    }
    
    return shape;
}

/**
 * Dispose Paddle Lite model to free resources
 * @param {Object} model - Paddle Lite model object
 */
export function disposePaddleLiteModel(model) {
    try {
        if (model && model.runner && typeof model.runner.dispose === 'function') {
            model.runner.dispose();
            console.log('Paddle Lite model disposed');
        }
    } catch (error) {
        console.warn('Error disposing Paddle Lite model:', error);
    }
}
