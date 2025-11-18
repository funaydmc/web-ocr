# Adding New OCR Models

This guide explains how to add new OCR models to the Web OCR system.

## Supported Model Formats

The system supports two model formats:

1. **ONNX Runtime (.onnx)**: Standard ONNX models running on ONNX Runtime WebAssembly
2. **Paddle Lite (.nb)**: Optimized Paddle Lite models running on Paddle Lite WebAssembly

## Prerequisites

### For ONNX Models
- ONNX model file (`.onnx`) compatible with ONNX Runtime Web
- Character dictionary file (`.txt`) with UTF-8 encoding
- Model input/output specifications

### For Paddle Lite Models
- Paddle Lite model file (`.nb`)
- Paddle Lite WebAssembly library loaded in your HTML
- Character dictionary file (`.txt`) with UTF-8 encoding
- Model input/output specifications

## Step-by-Step Guide

### 1. Obtain the Model Files

**For ONNX models:**
```bash
# Example: Converting PaddleOCR model to ONNX
paddle2onnx --model_dir ./inference/ch_ppocr_mobile_v2.0_rec \
            --model_filename inference.pdmodel \
            --params_filename inference.pdiparams \
            --save_file rec_mobile_v2.onnx \
            --opset_version 11 \
            --enable_onnx_checker True
```

**For Paddle Lite models:**
```bash
# Use Paddle Lite opt tool to convert PaddlePaddle model to .nb format
paddle_lite_opt --model_file=model.pdmodel \
                --param_file=model.pdiparams \
                --optimize_out=model_optimized \
                --optimize_out_type=naive_buffer \
                --valid_targets=arm,opencl,x86
# This generates model_optimized.nb file
```

### 2. Add Model Files to Project

Place your model files in the `static/models/` directory:

```bash
static/models/
├── rec_model.onnx           # ONNX model
├── rec_lite_v2.nb           # Paddle Lite model
└── ppocr_keys_v1.txt        # Shared dictionary
```

### 3. Include Paddle Lite Library (if using .nb models)

Add Paddle Lite WebAssembly script to your HTML before loading the application:

```html
<!-- In index.html, before loading main.js -->
<script src="static/lib/paddle-lite/paddle.js"></script>
<script src="static/lib/onnxruntime-web/dist/ort.min.js"></script>
<script type="module" src="src/web/main.js"></script>
```

### 4. Register Model in Configuration

Edit `src/lib/ocr/models-config.js` and add your model configuration:

**For ONNX models:**
```javascript
'your_onnx_model': {
    id: 'your_onnx_model',
    name: 'Your ONNX Model Name',
    description: 'Brief description',
    modelPath: 'static/models/your_model.onnx',
    dictionaryPath: 'static/models/ppocr_keys_v1.txt',
    inputShape: { width: 320, height: 48 },
    modelType: MODEL_TYPES.ONNX,
    version: '1.0',
    available: true
}
```

**For Paddle Lite models:**
```javascript
'your_lite_model': {
    id: 'your_lite_model',
    name: 'Your Paddle Lite Model',
    description: 'Optimized with Paddle Lite',
    modelPath: 'static/models/your_model.nb',
    dictionaryPath: 'static/models/ppocr_keys_v1.txt',
    inputShape: { width: 320, height: 48 },
    modelType: MODEL_TYPES.PADDLE_LITE,
    version: '2.0',
    available: true
}
```

### 4. Model Configuration Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique identifier for the model |
| `name` | string | Display name shown in UI |
| `description` | string | Short description of model characteristics |
| `modelPath` | string | Path to model file (.onnx or .nb) |
| `dictionaryPath` | string | Path to character dictionary file |
| `inputShape.width` | number | Model input width in pixels |
| `inputShape.height` | number | Model input height in pixels |
| `modelType` | string | `MODEL_TYPES.ONNX` or `MODEL_TYPES.PADDLE_LITE` |
| `version` | string | Model version |
| `available` | boolean | Whether model is available for use |

### 5. Model Requirements

#### ONNX Models

**Input Tensor:**
- **Name**: `x` (or adjust in `src/lib/ocr/index.js`)
- **Shape**: `[1, 3, height, width]` (NCHW format)
- **Data Type**: Float32
- **Value Range**: [0.0, 1.0] (normalized RGB values)

**Output Tensor:**
- **Shape**: `[1, time_steps, num_classes]`
- **Data Type**: Float32
- **Format**: Logits (unnormalized probabilities)
- **Time Steps**: Typically 40 for 320x48 input
- **Classes**: 6625 (1 blank + 6624 characters)

#### Paddle Lite Models

**Input Tensor:**
- **Shape**: `[1, height, width, 3]` (NHWC format - automatically converted)
- **Data Type**: Float32
- **Value Range**: [0.0, 1.0] (normalized RGB values)

**Output Tensor:**
- **Shape**: `[1, time_steps, num_classes]`
- **Data Type**: Float32
- **Format**: Logits (unnormalized probabilities)

**Note**: The system automatically handles format conversion between NCHW and NHWC.

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

## Paddle Lite Advantages

Paddle Lite models (.nb) offer several benefits:

1. **Smaller Size**: Optimized models are typically 30-50% smaller than ONNX
2. **Faster Inference**: Hardware-specific optimizations for better performance
3. **Mobile-First**: Designed specifically for mobile and web deployment
4. **Native Integration**: Direct support from PaddlePaddle ecosystem

## Example: Adding PaddleOCR Lite Model

```javascript
'paddleocr_lite_v2': {
    id: 'paddleocr_lite_v2',
    name: 'PaddleOCR Lite v2',
    description: 'Lightweight model optimized with Paddle Lite',
    modelPath: 'static/models/ch_ppocr_mobile_v2_rec.nb',
    dictionaryPath: 'static/models/ppocr_keys_v1.txt',
    inputShape: {
        width: 320,
        height: 48
    },
    modelType: MODEL_TYPES.PADDLE_LITE,
    version: '2.0',
    available: true
}
```

## Troubleshooting

### Model Not Loading

**ONNX Models:**
1. Check browser console for errors
2. Verify model file path is correct
3. Ensure model is ONNX format compatible with ONNX Runtime Web
4. Check model file size (large models may take time to load)

**Paddle Lite Models:**
1. Verify Paddle Lite WebAssembly library is loaded
2. Check console for "Paddle Lite not available" errors
3. Ensure .nb file is in correct format (use paddle_lite_opt tool)
4. Verify model was optimized for WebAssembly target

### Incorrect Recognition Results

1. Verify input preprocessing matches model training
2. Check dictionary file encoding (must be UTF-8)
3. Ensure dictionary order matches model output indices
4. Verify model input/output shapes
5. For Paddle Lite: Check if NHWC conversion is working correctly

### Performance Issues

1. Consider using Paddle Lite models for better web performance
2. Use quantized models for faster inference
3. Check WebAssembly backend is being used
4. Monitor browser memory usage
5. Test with smaller models first

### Paddle Lite Not Available Error

If you see "Paddle Lite WebAssembly is not available":

1. Add Paddle Lite script to HTML:
   ```html
   <script src="static/lib/paddle-lite/paddle.js"></script>
   ```

2. Ensure script loads before application code

3. Download Paddle Lite WebAssembly from:
   - https://github.com/PaddlePaddle/Paddle-Lite
   - Or use CDN link (check PaddlePaddle documentation)

4. Place in `static/lib/paddle-lite/` directory

## Quick Download with Scripts

For easier model deployment, use the provided download scripts:

```bash
# Using Python script (recommended)
cd scripts
python3 download_models.py v3 v4

# Or using Bash script
./download_models.sh v3
```

See [scripts/README.md](../scripts/README.md) for detailed usage instructions.

## Model Sources

### PaddleOCR Models

Official models: https://github.com/PaddlePaddle/PaddleOCR
- Chinese models: `ch_ppocr_mobile_v2.0`, `ch_ppocr_server_v2.0`, `ch_ppocr_v3`, `ch_ppocr_v4`
- English models: `en_ppocr_mobile_v2.0`, `en_ppocr_server_v2.0`
- Multilingual models: `ml_ppocr_mobile_v2.0`

### Download URLs

Pre-configured in the download scripts:
- PP-OCRv2 Mobile: `https://paddleocr.bj.bcebos.com/PP-OCRv2/chinese/ch_PP-OCRv2_rec_infer.tar`
- PP-OCRv2 Server: `https://paddleocr.bj.bcebos.com/PP-OCRv2/chinese/ch_PP-OCRv2_rec_server_infer.tar`
- PP-OCRv3: `https://paddleocr.bj.bcebos.com/PP-OCRv3/chinese/ch_PP-OCRv3_rec_infer.tar`
- PP-OCRv4: `https://paddleocr.bj.bcebos.com/PP-OCRv4/chinese/ch_PP-OCRv4_rec_infer.tar`

## References

- [PaddleOCR GitHub](https://github.com/PaddlePaddle/PaddleOCR)
- [PaddleOCR Model Deployment Guide](MODEL_DEPLOYMENT_GUIDE.md) - **Complete guide for downloading and deploying models**
- [Download Scripts Documentation](../scripts/README.md) - **Step-by-step usage instructions**
- [Paddle Lite](https://github.com/PaddlePaddle/Paddle-Lite)
- [Paddle Lite Deployment Guide](https://github.com/PaddlePaddle/PaddleOCR/blob/main/deploy/lite/readme_en.md)
- [ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/)
- [Model Zoo](https://github.com/PaddlePaddle/PaddleOCR/blob/main/doc/doc_en/models_list_en.md)
