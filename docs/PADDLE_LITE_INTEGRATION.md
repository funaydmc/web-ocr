# Paddle Lite WebAssembly Integration

## Overview

This document describes the Paddle Lite WebAssembly integration added to support .nb model files alongside ONNX models.

## What is Paddle Lite?

Paddle Lite is a lightweight inference engine from PaddlePaddle optimized for mobile and embedded devices. It provides:

- **Smaller Models**: 30-50% reduction in model size through optimization
- **Faster Inference**: Hardware-specific optimizations (ARM, OpenCL, X86)
- **Mobile-First**: Designed specifically for resource-constrained environments
- **Native Integration**: Direct support from PaddlePaddle ecosystem

## Architecture

### Model Type System

The system now supports two model types:

```javascript
export const MODEL_TYPES = {
    ONNX: 'onnx',           // ONNX Runtime WebAssembly
    PADDLE_LITE: 'paddle_lite'  // Paddle Lite WebAssembly
};
```

### Model Configuration

Models are configured with a `modelType` field:

```javascript
// ONNX Model
{
    id: 'paddleocr_v1',
    modelPath: 'static/models/rec_model.onnx',
    modelType: MODEL_TYPES.ONNX,
    available: true
}

// Paddle Lite Model
{
    id: 'paddleocr_lite_v2',
    modelPath: 'static/models/rec_lite_v2.nb',
    modelType: MODEL_TYPES.PADDLE_LITE,
    available: true
}
```

## Implementation Details

### 1. Paddle Lite Module (`paddle-lite.js`)

Provides core functionality:

- **Model Loading**: `loadPaddleLiteModel(modelPath)`
- **Inference**: `runPaddleLiteInference(model, tensor, config)`
- **Format Conversion**: `nchwToNhwc(tensor, height, width)`
- **Output Extraction**: `extractPaddleLiteOutput(result)`
- **Availability Check**: `isPaddleLiteAvailable()`

### 2. Enhanced OCR Module (`index.js`)

Updated `loadModel()` and `recognizeText()` functions:

```javascript
export async function loadModel(modelId) {
    const config = getModelConfig(modelId);
    const modelType = config.modelType || MODEL_TYPES.ONNX;
    
    if (modelType === MODEL_TYPES.PADDLE_LITE) {
        // Load Paddle Lite model
        const model = await loadPaddleLiteModel(config.modelPath);
        return { ...model, modelType: MODEL_TYPES.PADDLE_LITE, config };
    } else {
        // Load ONNX model (default)
        const model = await ort.InferenceSession.create(config.modelPath, {...});
        return { session: model, modelType: MODEL_TYPES.ONNX, config };
    }
}
```

### 3. Format Conversion

**Key Challenge**: ONNX models use NCHW format, Paddle Lite uses NHWC.

**Solution**: Automatic conversion in `paddle-lite.js`:

```javascript
function nchwToNhwc(nchwTensor, height, width) {
    // Convert [1, 3, H, W] to [1, H, W, 3]
    for (let h = 0; h < height; h++) {
        for (let w = 0; w < width; w++) {
            // Reorder R, G, B channels
            nhwcTensor[h * width * 3 + w * 3] = nchwTensor[h * width + w]; // R
            nhwcTensor[h * width * 3 + w * 3 + 1] = nchwTensor[H*W + h*width + w]; // G
            nhwcTensor[h * width * 3 + w * 3 + 2] = nchwTensor[2*H*W + h*width + w]; // B
        }
    }
}
```

## Setup Instructions

### 1. Download Paddle Lite WebAssembly

```bash
# From Paddle-Lite repository
git clone https://github.com/PaddlePaddle/Paddle-Lite.git

# Copy WebAssembly files to project
cp Paddle-Lite/web/paddle.js static/lib/paddle-lite/
cp Paddle-Lite/web/paddle.wasm static/lib/paddle-lite/
```

### 2. Include in HTML

```html
<!-- Add before main.js -->
<script src="static/lib/paddle-lite/paddle.js"></script>
<script type="module" src="src/web/main.js"></script>
```

### 3. Convert Model to .nb Format

```bash
# Use paddle_lite_opt tool
paddle_lite_opt \
  --model_file=inference.pdmodel \
  --param_file=inference.pdiparams \
  --optimize_out=rec_lite_v2 \
  --optimize_out_type=naive_buffer \
  --valid_targets=x86,arm,opencl

# Generates rec_lite_v2.nb
```

### 4. Add Model Configuration

```javascript
// In models-config.js
'paddleocr_lite_v2': {
    id: 'paddleocr_lite_v2',
    name: 'PaddleOCR Lite v2',
    description: 'Optimized with Paddle Lite',
    modelPath: 'static/models/rec_lite_v2.nb',
    dictionaryPath: 'static/models/ppocr_keys_v1.txt',
    inputShape: { width: 320, height: 48 },
    modelType: MODEL_TYPES.PADDLE_LITE,
    version: '2.0',
    available: true
}
```

## Error Handling

### Graceful Degradation

If Paddle Lite is not available:

```javascript
if (!isPaddleLiteAvailable()) {
    console.warn('Paddle Lite not available');
    throw new Error('Paddle Lite WebAssembly is not loaded');
}
```

The system will:
1. Display error message
2. Continue working with ONNX models
3. Allow user to retry after loading library

### Fallback Strategy

In `main.js`, model loading includes fallback:

```javascript
try {
    if (!loadedModels[modelId]) {
        loadedModels[modelId] = await loadModel(modelId);
    }
} catch (error) {
    console.warn(`Failed to load model ${modelId}:`, error);
    if (modelId !== 'paddleocr_v1') {
        // Fallback to default ONNX model
        currentModelId = 'paddleocr_v1';
        await loadCurrentModel();
    }
}
```

## Testing

### Unit Testing

Test Paddle Lite integration:

```javascript
// Check availability
console.assert(isPaddleLiteAvailable() === (typeof paddlejs !== 'undefined'));

// Test format conversion
const nchw = new Float32Array([...]);
const nhwc = nchwToNhwc(nchw, 48, 320);
// Verify first pixel R,G,B channels are correct
```

### Integration Testing

1. Load Paddle Lite model
2. Process test images
3. Compare accuracy with ONNX model
4. Verify processing time improvements

## Performance Comparison

Expected improvements with Paddle Lite:

| Metric | ONNX | Paddle Lite | Improvement |
|--------|------|-------------|-------------|
| Model Size | 10.8 MB | 6-8 MB | 30-40% smaller |
| Load Time | ~2-3s | ~1-2s | ~40% faster |
| Inference Time | ~75ms | ~50-60ms | ~20-30% faster |
| Memory Usage | Higher | Lower | More efficient |

*Actual results may vary based on model and hardware*

## Troubleshooting

### Common Issues

**1. "Paddle Lite not available" error**

Solution:
```html
<!-- Ensure script is loaded before main.js -->
<script src="static/lib/paddle-lite/paddle.js"></script>
```

**2. Format conversion errors**

Check:
- Input tensor shape matches expected [1, 3, H, W]
- Height and width values are correct
- Data type is Float32Array

**3. Incorrect recognition results**

Verify:
- Model preprocessing matches training
- Dictionary file is correct
- Model output shape is [1, time_steps, num_classes]

## Future Enhancements

1. **Quantized Models**: Support INT8 quantized models for even better performance
2. **Multi-Backend**: Allow runtime selection of compute backend (CPU, GPU, NPU)
3. **Model Caching**: Cache compiled models in IndexedDB
4. **Progressive Loading**: Stream large models progressively
5. **Worker Threads**: Run inference in Web Workers for non-blocking UI

## References

- [Paddle Lite Documentation](https://paddlepaddle.github.io/Paddle-Lite/)
- [Paddle Lite GitHub](https://github.com/PaddlePaddle/Paddle-Lite)
- [PaddleOCR Lite Deployment](https://github.com/PaddlePaddle/PaddleOCR/tree/main/deploy/lite)
- [Model Optimization Guide](https://paddlepaddle.github.io/Paddle-Lite/v2.10/user_guides/model_optimize_tool/)

## Conclusion

The Paddle Lite integration provides a flexible, high-performance alternative to ONNX models while maintaining full backward compatibility. Users can choose the best model format for their needs based on size, speed, and accuracy requirements.
