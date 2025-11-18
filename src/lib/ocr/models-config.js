/**
 * Configuration for available OCR models
 * Supports both ONNX Runtime and Paddle Lite WebAssembly
 */

export const MODEL_TYPES = {
    ONNX: 'onnx',
    PADDLE_LITE: 'paddle_lite'
};

export const MODEL_CONFIGS = {
    'paddleocr_v1': {
        id: 'paddleocr_v1',
        name: 'PaddleOCR v1 (Original)',
        description: 'Original PaddleOCR recognition model (ONNX)',
        modelPath: 'static/models/rec_model.onnx',
        dictionaryPath: 'static/models/ppocr_keys_v1.txt',
        inputShape: {
            width: 320,
            height: 48
        },
        modelType: MODEL_TYPES.ONNX,
        version: '1.0',
        available: true
    },
    
    // PP-OCRv2 Models
    'paddleocr_mobile_v2': {
        id: 'paddleocr_mobile_v2',
        name: 'PP-OCRv2 Mobile',
        description: 'Lightweight mobile-optimized model - Fast inference, smaller size (8.5MB)',
        modelPath: 'static/models/rec_mobile_v2.onnx',
        dictionaryPath: 'static/models/ppocr_keys_v1.txt',
        inputShape: { 
            width: 320, 
            height: 48 
        },
        modelType: MODEL_TYPES.ONNX,
        version: '2.0',
        available: false  // Set to true after downloading with scripts/download_models.sh
    },
    
    'paddleocr_server_v2': {
        id: 'paddleocr_server_v2',
        name: 'PP-OCRv2 Server',
        description: 'High accuracy server model - Better accuracy, larger size (94MB)',
        modelPath: 'static/models/rec_server_v2.onnx',
        dictionaryPath: 'static/models/ppocr_keys_v1.txt',
        inputShape: { 
            width: 320, 
            height: 48 
        },
        modelType: MODEL_TYPES.ONNX,
        version: '2.0',
        available: false  // Set to true after downloading with scripts/download_models.sh
    },
    
    // PP-OCRv3 Model
    'paddleocr_v3': {
        id: 'paddleocr_v3',
        name: 'PP-OCRv3',
        description: 'Latest stable version - Improved accuracy and speed (12MB)',
        modelPath: 'static/models/rec_v3.onnx',
        dictionaryPath: 'static/models/ppocr_keys_v1.txt',
        inputShape: { 
            width: 320, 
            height: 48 
        },
        modelType: MODEL_TYPES.ONNX,
        version: '3.0',
        available: false  // Set to true after downloading with scripts/download_models.sh
    },
    
    // PP-OCRv4 Model
    'paddleocr_v4': {
        id: 'paddleocr_v4',
        name: 'PP-OCRv4 (Newest)',
        description: 'Newest version - Best performance and accuracy (10MB)',
        modelPath: 'static/models/rec_v4.onnx',
        dictionaryPath: 'static/models/ppocr_keys_v1.txt',
        inputShape: { 
            width: 320, 
            height: 48 
        },
        modelType: MODEL_TYPES.ONNX,
        version: '4.0',
        available: false  // Set to true after downloading with scripts/download_models.sh
    },
    
    // Paddle Lite Models (for advanced users)
    'paddleocr_lite_v2_mobile': {
        id: 'paddleocr_lite_v2_mobile',
        name: 'PP-OCRv2 Lite Mobile',
        description: 'Optimized with Paddle Lite - 30-50% smaller, faster inference',
        modelPath: 'static/models/rec_mobile_v2.nb',
        dictionaryPath: 'static/models/ppocr_keys_v1.txt',
        inputShape: { 
            width: 320, 
            height: 48 
        },
        modelType: MODEL_TYPES.PADDLE_LITE,
        version: '2.0',
        available: false  // Requires Paddle Lite WebAssembly and .nb model file
    },
    
    'paddleocr_lite_v3': {
        id: 'paddleocr_lite_v3',
        name: 'PP-OCRv3 Lite',
        description: 'v3 optimized with Paddle Lite - Best for mobile/web deployment',
        modelPath: 'static/models/rec_v3.nb',
        dictionaryPath: 'static/models/ppocr_keys_v1.txt',
        inputShape: { 
            width: 320, 
            height: 48 
        },
        modelType: MODEL_TYPES.PADDLE_LITE,
        version: '3.0',
        available: false  // Requires Paddle Lite WebAssembly and .nb model file
    }
};

/**
 * Get list of available models
 * @returns {Array} Array of model configurations
 */
export function getAvailableModels() {
    return Object.values(MODEL_CONFIGS).filter(model => model.available !== false);
}

/**
 * Get model configuration by ID
 * @param {string} modelId - Model identifier
 * @returns {Object} Model configuration
 */
export function getModelConfig(modelId) {
    return MODEL_CONFIGS[modelId];
}

/**
 * Get default model ID
 * @returns {string} Default model ID
 */
export function getDefaultModelId() {
    return 'paddleocr_v1';
}
