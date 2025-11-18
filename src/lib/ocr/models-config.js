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
        name: 'PaddleOCR v1',
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
    }
    // Additional models can be added here when available:
    // ONNX models:
    // 'paddleocr_mobile_v2': {
    //     id: 'paddleocr_mobile_v2',
    //     name: 'PaddleOCR Mobile v2',
    //     description: 'Lightweight mobile-optimized model (ONNX)',
    //     modelPath: 'static/models/rec_mobile_v2.onnx',
    //     dictionaryPath: 'static/models/ppocr_keys_v1.txt',
    //     inputShape: { width: 320, height: 48 },
    //     modelType: MODEL_TYPES.ONNX,
    //     version: '2.0',
    //     available: false
    // },
    // Paddle Lite models (.nb):
    // 'paddleocr_lite_v2': {
    //     id: 'paddleocr_lite_v2',
    //     name: 'PaddleOCR Lite v2',
    //     description: 'Optimized for mobile/web with Paddle Lite',
    //     modelPath: 'static/models/rec_lite_v2.nb',
    //     dictionaryPath: 'static/models/ppocr_keys_v1.txt',
    //     inputShape: { width: 320, height: 48 },
    //     modelType: MODEL_TYPES.PADDLE_LITE,
    //     version: '2.0',
    //     available: false
    // }
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
