# Adding New OCR Models

This guide explains how to add new OCR models to the Web OCR system.

## Prerequisites

- ONNX model file (`.onnx`) compatible with ONNX Runtime Web
- Character dictionary file (`.txt`) with UTF-8 encoding
- Model input/output specifications

## Step-by-Step Guide

### 1. Obtain the Model Files

Download or convert your PaddleOCR model to ONNX format:

```bash
# Example: Converting PaddleOCR model to ONNX
paddle2onnx --model_dir ./inference/ch_ppocr_mobile_v2.0_rec \
            --model_filename inference.pdmodel \
            --params_filename inference.pdiparams \
            --save_file rec_mobile_v2.onnx \
            --opset_version 11 \
            --enable_onnx_checker True
```

### 2. Add Model Files to Project

Place your model files in the `static/models/` directory:

```bash
static/models/
├── rec_model.onnx           # Original model
├── rec_mobile_v2.onnx       # New model (example)
├── rec_server_v2.onnx       # New model (example)
└── ppocr_keys_v1.txt        # Shared dictionary
```

### 3. Register Model in Configuration

Edit `src/lib/ocr/models-config.js` and add your model configuration:

```javascript
export const MODEL_CONFIGS = {
    // ... existing models ...
    
    'your_model_id': {
        id: 'your_model_id',
        name: 'Your Model Name',
        description: 'Brief description of the model',
        modelPath: 'static/models/your_model.onnx',
        dictionaryPath: 'static/models/ppocr_keys_v1.txt',
        inputShape: {
            width: 320,    // Model input width
            height: 48     // Model input height
        },
        version: '1.0',
        available: true    // Set to true to enable
    }
};
```

### 4. Model Configuration Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique identifier for the model |
| `name` | string | Display name shown in UI |
| `description` | string | Short description of model characteristics |
| `modelPath` | string | Path to ONNX model file |
| `dictionaryPath` | string | Path to character dictionary file |
| `inputShape.width` | number | Model input width in pixels |
| `inputShape.height` | number | Model input height in pixels |
| `version` | string | Model version |
| `available` | boolean | Whether model is available for use |

### 5. Model Requirements

Your ONNX model must meet these requirements:

#### Input Tensor
- **Name**: `x` (or adjust in `src/lib/ocr/index.js`)
- **Shape**: `[1, 3, height, width]` (NCHW format)
- **Data Type**: Float32
- **Value Range**: [0.0, 1.0] (normalized RGB values)

#### Output Tensor
- **Shape**: `[1, time_steps, num_classes]`
- **Data Type**: Float32
- **Format**: Logits (unnormalized probabilities)
- **Time Steps**: Typically 40 for 320x48 input
- **Classes**: 6625 (1 blank + 6624 characters)

### 6. Dictionary Format

The character dictionary file should:
- Use UTF-8 encoding
- Have one character per line
- Use LF (`\n`) line separators
- Have exactly 6623 lines (for Chinese OCR)
- Index 0 is reserved for blank token (CTC)

### 7. Test Your Model

After adding the model configuration:

1. Restart your web server
2. Open the web interface
3. Select your model from the "OCR Model" dropdown
4. Click "Test All Images" to benchmark accuracy and speed
5. Click "Compare All Models" to compare with other models

## Example: Adding PaddleOCR Mobile v2

```javascript
'paddleocr_mobile_v2': {
    id: 'paddleocr_mobile_v2',
    name: 'PaddleOCR Mobile v2',
    description: 'Lightweight mobile-optimized model for faster inference',
    modelPath: 'static/models/rec_mobile_v2.onnx',
    dictionaryPath: 'static/models/ppocr_keys_v1.txt',
    inputShape: {
        width: 320,
        height: 48
    },
    version: '2.0',
    available: true
}
```

## Troubleshooting

### Model Not Loading

1. Check browser console for errors
2. Verify model file path is correct
3. Ensure model is ONNX format compatible with ONNX Runtime Web
4. Check model file size (large models may take time to load)

### Incorrect Recognition Results

1. Verify input preprocessing matches model training
2. Check dictionary file encoding (must be UTF-8)
3. Ensure dictionary order matches model output indices
4. Verify model input/output shapes

## Model Sources

### PaddleOCR Models

Official models: https://github.com/PaddlePaddle/PaddleOCR
- Chinese models: `ch_ppocr_mobile_v2.0`, `ch_ppocr_server_v2.0`
- English models: `en_ppocr_mobile_v2.0`, `en_ppocr_server_v2.0`
- Multilingual models: `ml_ppocr_mobile_v2.0`

## References

- [PaddleOCR GitHub](https://github.com/PaddlePaddle/PaddleOCR)
- [ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/)
- [Model Zoo](https://github.com/PaddlePaddle/PaddleOCR/blob/main/doc/doc_en/models_list_en.md)
