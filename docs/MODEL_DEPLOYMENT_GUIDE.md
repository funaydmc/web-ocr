# PaddleOCR Model Deployment Guide

This guide explains how to download, deploy, and test different PaddleOCR models in the Web OCR system.

## 📋 Table of Contents

- [Available Models](#available-models)
- [Quick Start](#quick-start)
- [Manual Installation](#manual-installation)
- [Model Comparison](#model-comparison)
- [Testing Models](#testing-models)
- [Troubleshooting](#troubleshooting)

## 🎯 Available Models

The Web OCR system supports multiple PaddleOCR models with different characteristics:

### Currently Active

| Model | Version | Size | Speed | Accuracy | Status |
|-------|---------|------|-------|----------|--------|
| PaddleOCR v1 (Original) | 1.0 | 11 MB | Medium | 91.95% | ✅ Active |

### Available for Download

| Model | Version | Size | Speed | Accuracy | Use Case |
|-------|---------|------|-------|----------|----------|
| PP-OCRv2 Mobile | 2.0 | 8.5 MB | Fast | ~92% | Mobile/Web deployment |
| PP-OCRv2 Server | 2.0 | 94 MB | Slow | ~95% | High accuracy needs |
| PP-OCRv3 | 3.0 | 12 MB | Fast | ~93% | Balanced performance |
| PP-OCRv4 | 4.0 | 10 MB | Very Fast | ~94% | Latest technology |

### Paddle Lite Models (Advanced)

| Model | Version | Size | Speed | Benefits |
|-------|---------|------|-------|----------|
| PP-OCRv2 Lite Mobile | 2.0 | ~5 MB | Very Fast | 40% smaller than ONNX |
| PP-OCRv3 Lite | 3.0 | ~7 MB | Very Fast | Best for web/mobile |

## 🚀 Quick Start

### Method 1: Using Download Script (Recommended)

1. **Install Prerequisites**:
   ```bash
   pip install paddle2onnx
   ```

2. **Run Download Script**:
   ```bash
   cd scripts
   chmod +x download_models.sh
   
   # Download all models
   ./download_models.sh all
   
   # Or download specific model
   ./download_models.sh v3
   ```

3. **Enable Models**:
   Edit `src/lib/ocr/models-config.js` and set `available: true` for downloaded models:
   ```javascript
   'paddleocr_v3': {
       // ... other config
       available: true  // Change from false to true
   }
   ```

4. **Test in Web Interface**:
   - Refresh the browser
   - Select model from dropdown
   - Test with images

### Method 2: Direct Links

Download pre-converted ONNX models:

```bash
cd static/models

# PP-OCRv2 Mobile (Fast, lightweight)
wget https://paddleocr.bj.bcebos.com/PP-OCRv2/chinese/ch_PP-OCRv2_rec_infer.tar
tar -xf ch_PP-OCRv2_rec_infer.tar

# Convert to ONNX
paddle2onnx \
  --model_dir ch_PP-OCRv2_rec_infer \
  --model_filename inference.pdmodel \
  --params_filename inference.pdiparams \
  --save_file rec_mobile_v2.onnx \
  --opset_version 11
```

## 📥 Manual Installation

### Step 1: Download PaddlePaddle Model

Download from official PaddleOCR repository:

**PP-OCRv3 Example:**
```bash
# Download model
wget https://paddleocr.bj.bcebos.com/PP-OCRv3/chinese/ch_PP-OCRv3_rec_infer.tar

# Extract
tar -xf ch_PP-OCRv3_rec_infer.tar

# You'll get:
# ch_PP-OCRv3_rec_infer/
# ├── inference.pdmodel
# ├── inference.pdiparams
# └── inference.pdiparams.info
```

### Step 2: Convert to ONNX

```bash
# Install conversion tool
pip install paddle2onnx

# Convert
paddle2onnx \
  --model_dir ch_PP-OCRv3_rec_infer \
  --model_filename inference.pdmodel \
  --params_filename inference.pdiparams \
  --save_file rec_v3.onnx \
  --opset_version 11 \
  --enable_onnx_checker True
```

### Step 3: Move to Models Directory

```bash
# Copy to web-ocr models directory
cp rec_v3.onnx /path/to/web-ocr/static/models/
```

### Step 4: Enable in Configuration

Edit `src/lib/ocr/models-config.js`:

```javascript
'paddleocr_v3': {
    id: 'paddleocr_v3',
    name: 'PP-OCRv3',
    description: 'Latest stable version - Improved accuracy and speed',
    modelPath: 'static/models/rec_v3.onnx',
    dictionaryPath: 'static/models/ppocr_keys_v1.txt',
    inputShape: { width: 320, height: 48 },
    modelType: MODEL_TYPES.ONNX,
    version: '3.0',
    available: true  // Change this to true
}
```

### Step 5: Test the Model

1. Restart your web server:
   ```bash
   python3 -m http.server 8000
   ```

2. Open browser at `http://localhost:8000`

3. Select "PP-OCRv3" from the model dropdown

4. Test with images

## 📊 Model Comparison

### Performance Characteristics

#### PP-OCRv2 Mobile
- **Best for**: Web/mobile deployment, quick prototypes
- **Pros**: Small size, fast inference, low memory usage
- **Cons**: Slightly lower accuracy than server models
- **Use when**: Speed and size matter more than accuracy

#### PP-OCRv2 Server
- **Best for**: High accuracy requirements, server deployment
- **Pros**: Highest accuracy, robust recognition
- **Cons**: Large model size, slower inference
- **Use when**: Accuracy is critical, resources available

#### PP-OCRv3
- **Best for**: General purpose Chinese OCR
- **Pros**: Balanced speed/accuracy, improved architecture
- **Cons**: Moderate size
- **Use when**: Need good balance of all factors

#### PP-OCRv4
- **Best for**: Latest features and performance
- **Pros**: Best accuracy, fastest inference, optimized architecture
- **Cons**: Newest, may have fewer examples
- **Use when**: Want cutting-edge performance

### Benchmark Comparison

Run comparison in web interface with "Compare All Models" button.

Expected results (on test dataset):

| Model | Avg Accuracy | Avg Time | Perfect Matches |
|-------|--------------|----------|-----------------|
| v1 Original | 91.95% | 89ms | 6/10 |
| v2 Mobile | ~92% | 70ms | 6-7/10 |
| v2 Server | ~95% | 150ms | 8/10 |
| v3 | ~93% | 75ms | 7/10 |
| v4 | ~94% | 65ms | 7-8/10 |

*Note: Actual performance varies based on hardware and browser*

## 🧪 Testing Models

### Test Single Image

1. Select model from dropdown
2. Upload image
3. View results and processing time
4. Compare with ground truth (if available)

### Test All Images

1. Click "Test All Images" button
2. System processes all test images (10 images)
3. View summary table with per-image results
4. See overall statistics:
   - Average accuracy
   - Average processing time
   - Perfect match count
   - Total characters correct

### Compare All Models

1. Click "Compare All Models" button
2. System tests all available models on all images
3. View ranked comparison table
4. See which model performs best for your use case

## 🔧 Advanced: Paddle Lite Models

For even better performance, use Paddle Lite optimized models (.nb format).

### Prerequisites

1. **Download Paddle Lite WebAssembly**:
   ```bash
   # Clone Paddle-Lite repository
   git clone https://github.com/PaddlePaddle/Paddle-Lite.git
   
   # Copy WebAssembly files
   mkdir -p static/lib/paddle-lite
   cp Paddle-Lite/web/paddle.js static/lib/paddle-lite/
   cp Paddle-Lite/web/paddle.wasm static/lib/paddle-lite/
   ```

2. **Enable in HTML**:
   ```html
   <!-- In index.html, uncomment this line: -->
   <script src="static/lib/paddle-lite/paddle.js"></script>
   ```

### Convert Model to .nb Format

```bash
# Install Paddle Lite opt tool
pip install paddlelite

# Convert model
paddle_lite_opt \
  --model_file=inference.pdmodel \
  --param_file=inference.pdiparams \
  --optimize_out=rec_v3 \
  --optimize_out_type=naive_buffer \
  --valid_targets=x86,arm,opencl

# Generates rec_v3.nb file
cp rec_v3.nb static/models/
```

### Configure Paddle Lite Model

```javascript
'paddleocr_lite_v3': {
    id: 'paddleocr_lite_v3',
    name: 'PP-OCRv3 Lite',
    description: 'Optimized with Paddle Lite',
    modelPath: 'static/models/rec_v3.nb',
    dictionaryPath: 'static/models/ppocr_keys_v1.txt',
    inputShape: { width: 320, height: 48 },
    modelType: MODEL_TYPES.PADDLE_LITE,
    version: '3.0',
    available: true
}
```

## 🐛 Troubleshooting

### Model Not Loading

**Problem**: Model dropdown doesn't show new model

**Solutions**:
1. Check `available: true` in models-config.js
2. Clear browser cache (Ctrl+Shift+R)
3. Check browser console for errors
4. Verify model file exists in static/models/

### Conversion Errors

**Problem**: paddle2onnx fails to convert

**Solutions**:
1. Update paddle2onnx: `pip install --upgrade paddle2onnx`
2. Check model files are complete
3. Verify opset_version (try 11, 12, or 13)
4. Ensure model is for recognition (not detection)

### Download Fails

**Problem**: wget/curl cannot download files

**Solutions**:
1. Check internet connection
2. Try alternative mirror sites
3. Download manually from browser
4. Use VPN if site is blocked

### Model Runs But Results Are Wrong

**Problem**: Model loads but gives incorrect OCR

**Solutions**:
1. Verify dictionary file is correct
2. Check input preprocessing matches model training
3. Ensure input shape is correct (320x48)
4. Test with known-good images first

### Out of Memory Error

**Problem**: Browser runs out of memory

**Solutions**:
1. Use mobile models instead of server models
2. Close other browser tabs
3. Test one model at a time
4. Increase browser memory limit

## 📚 References

### Official PaddleOCR Resources

- **Main Repository**: https://github.com/PaddlePaddle/PaddleOCR
- **Model List**: https://github.com/PaddlePaddle/PaddleOCR/blob/main/doc/doc_en/models_list_en.md
- **Deployment Guide**: https://github.com/PaddlePaddle/PaddleOCR/blob/main/deploy/README.md
- **Lite Deployment**: https://github.com/PaddlePaddle/PaddleOCR/blob/main/deploy/lite/readme_en.md

### Model Download Links

**PP-OCRv2**:
- Mobile: `https://paddleocr.bj.bcebos.com/PP-OCRv2/chinese/ch_PP-OCRv2_rec_infer.tar`
- Server: `https://paddleocr.bj.bcebos.com/PP-OCRv2/chinese/ch_PP-OCRv2_rec_server_infer.tar`

**PP-OCRv3**:
- Chinese: `https://paddleocr.bj.bcebos.com/PP-OCRv3/chinese/ch_PP-OCRv3_rec_infer.tar`

**PP-OCRv4**:
- Chinese: `https://paddleocr.bj.bcebos.com/PP-OCRv4/chinese/ch_PP-OCRv4_rec_infer.tar`

### Tools

- **paddle2onnx**: Convert PaddlePaddle models to ONNX
  - GitHub: https://github.com/PaddlePaddle/Paddle2ONNX
  - Install: `pip install paddle2onnx`

- **Paddle Lite**: Optimize models for mobile/web
  - GitHub: https://github.com/PaddlePaddle/Paddle-Lite
  - Docs: https://paddlepaddle.github.io/Paddle-Lite/

## 💡 Tips

1. **Start with v3**: PP-OCRv3 offers the best balance for most use cases
2. **Test locally first**: Verify models work before deploying
3. **Compare models**: Use "Compare All Models" to find best for your data
4. **Consider size**: Mobile models are better for web deployment
5. **Monitor performance**: Track accuracy and speed metrics
6. **Use Paddle Lite**: For production, consider .nb models for better performance

## ✅ Checklist

Before deploying a new model:

- [ ] Model downloaded and extracted
- [ ] Converted to ONNX format (or .nb for Paddle Lite)
- [ ] Model file copied to static/models/
- [ ] Configuration added to models-config.js
- [ ] `available: true` set in config
- [ ] Web server restarted
- [ ] Browser cache cleared
- [ ] Model appears in dropdown
- [ ] Test with single image successful
- [ ] Test with all images completed
- [ ] Performance compared with other models
- [ ] Results documented

## 🎯 Summary

This guide covers:
- ✅ Downloading PaddleOCR models
- ✅ Converting to ONNX format
- ✅ Deploying in web interface
- ✅ Testing and comparing models
- ✅ Optimizing with Paddle Lite
- ✅ Troubleshooting common issues

Follow the Quick Start for fastest setup, or Manual Installation for more control.

For questions or issues, refer to the official PaddleOCR documentation or open an issue in the repository.
