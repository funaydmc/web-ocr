# Hướng Dẫn Thêm Models - Adding Models Guide

## 📋 Tổng Quan

Dự án đã được cấu hình đầy đủ để hỗ trợ nhiều PaddleOCR models. Hiện tại chỉ có v1 được bao gồm, nhưng bạn có thể dễ dàng thêm các models khác.

## 🎯 Models Được Hỗ Trợ

| Model ID | Tên | Kích Thước | Mô Tả | Trạng Thái |
|----------|-----|------------|-------|------------|
| paddleocr_v1 | PaddleOCR v1 (Original) | 11 MB | Model gốc | ✅ Đã có |
| paddleocr_mobile_v2 | PP-OCRv2 Mobile | 8.5 MB | Nhỏ, nhanh | 📥 Cần tải |
| paddleocr_server_v2 | PP-OCRv2 Server | 94 MB | Độ chính xác cao | 📥 Cần tải |
| paddleocr_v3 | PP-OCRv3 | 12 MB | Cân bằng tốt | 📥 Cần tải |
| paddleocr_v4 | PP-OCRv4 | 10 MB | Mới nhất | 📥 Cần tải |

## 🚀 Hướng Dẫn Từng Bước

### Bước 1: Cài Đặt Công Cụ Chuyển Đổi

```bash
# Cài đặt paddle2onnx và dependencies
pip install paddle2onnx requests tqdm

# Hoặc với pip3
pip3 install paddle2onnx requests tqdm
```

**Kiểm tra cài đặt:**
```bash
paddle2onnx --version
python3 -c "import paddle2onnx; print('OK')"
```

### Bước 2: Tải và Chuyển Đổi Models

Script `scripts/download_models.py` sẽ tự động:
1. Tải model từ PaddleOCR repository
2. Giải nén file .tar
3. Chuyển đổi từ PaddlePaddle → ONNX
4. Lưu vào `static/models/`

**Tải tất cả models:**
```bash
cd scripts
python3 download_models.py
```

**Tải model cụ thể:**
```bash
# Chỉ tải PP-OCRv3
python3 download_models.py v3

# Tải v3 và v4
python3 download_models.py v3 v4

# Tải mobile model (nhỏ gọn)
python3 download_models.py v2_mobile

# Tải server model (độ chính xác cao)
python3 download_models.py v2_server
```

**Xem danh sách models:**
```bash
python3 download_models.py --list
```

### Bước 3: Kích Hoạt Models

Sau khi tải xong, cập nhật file `src/lib/ocr/models-config.js`:

```javascript
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
    available: true  // ← Đổi từ false sang true
}
```

### Bước 4: Khởi Động Lại Server

```bash
# Dừng server hiện tại (Ctrl+C)
# Sau đó khởi động lại
python3 -m http.server 8000
```

### Bước 5: Kiểm Tra Trong Browser

1. Mở `http://localhost:8000`
2. Model dropdown sẽ tự động benchmark models
3. Kết quả benchmark hiển thị: `[accuracy% | time ms]`
4. Ví dụ: "✓ PP-OCRv3 [92.50% | 95ms]"

## 🔧 Quy Trình Chuyển Đổi Model

### Cách Script Hoạt Động

```
PaddlePaddle Model (.tar)
    ↓ Download
Extracted Files
    ├── inference.pdmodel
    └── inference.pdiparams
    ↓ Convert (paddle2onnx)
ONNX Model (.onnx)
    ↓ Save
static/models/rec_*.onnx
```

### Chuyển Đổi Thủ Công (Nếu Cần)

```bash
# Giải nén model PaddlePaddle
tar -xf ch_PP-OCRv3_rec_infer.tar

# Chuyển đổi sang ONNX
paddle2onnx \
    --model_dir ch_PP-OCRv3_rec_infer \
    --model_filename inference.pdmodel \
    --params_filename inference.pdiparams \
    --save_file static/models/rec_v3.onnx \
    --opset_version 11 \
    --enable_onnx_checker True
```

## 📊 Benchmark Tự Động

Khi model được đánh dấu `available: true`, hệ thống sẽ tự động:

1. **Tải model và dictionary** khi khởi động
2. **Chạy benchmark** với 3 ảnh test đầu tiên
3. **Tính toán metrics**:
   - Average accuracy (%)
   - Average processing time (ms)
4. **Hiển thị trong dropdown**:
   ```
   ✓ PP-OCRv3 [92.50% | 95ms] - Latest stable version
   ```

## 🎨 Kết Quả Trong UI

### Model Dropdown
```
✓ PaddleOCR v1 (Original) [86.67% | 103ms]
✓ PP-OCRv2 Mobile [89.50% | 85ms]
✓ PP-OCRv3 [92.50% | 95ms]
✓ PP-OCRv4 [94.00% | 88ms]
📥 PP-OCRv2 Server (chưa tải)
```

### Test All Images Button
Khi click "Test All Images", tất cả models có `available: true` sẽ được test và hiển thị:
- Kết quả sắp xếp theo độ chính xác (cao → thấp)
- Model tốt nhất có icon 🥇
- Thống kê chi tiết cho từng model

### Compare All Models Button
So sánh trực quan giữa các models với bảng xếp hạng.

## 🐛 Xử Lý Lỗi

### Lỗi: "paddle2onnx not found"
```bash
pip install paddle2onnx
# Hoặc
pip3 install --user paddle2onnx
```

### Lỗi: "Cannot download file"
- Kiểm tra kết nối internet
- Thử lại sau vài phút
- Hoặc tải thủ công:
  1. Tải .tar từ [PaddleOCR Model List](https://github.com/PaddlePaddle/PaddleOCR/blob/main/doc/doc_en/models_list_en.md)
  2. Giải nén
  3. Chuyển đổi bằng `paddle2onnx` (xem phần trên)

### Lỗi: "Model không xuất hiện trong dropdown"
```bash
# 1. Kiểm tra file model tồn tại
ls -la static/models/rec_v3.onnx

# 2. Kiểm tra config
grep -A 5 "paddleocr_v3" src/lib/ocr/models-config.js

# 3. Đảm bảo available: true

# 4. Xóa cache browser
# Ctrl+Shift+R hoặc Hard Reload

# 5. Restart server
```

### Lỗi: "Out of memory"
- Sử dụng mobile models (nhỏ hơn)
- Test từng model một
- Đóng các tab browser khác

## 📝 Checklist Thêm Model

- [ ] Cài đặt `paddle2onnx`, `requests`, `tqdm`
- [ ] Chạy `python3 download_models.py <model_id>`
- [ ] Kiểm tra file `.onnx` trong `static/models/`
- [ ] Cập nhật `available: true` trong `models-config.js`
- [ ] Restart web server
- [ ] Xóa cache browser (Ctrl+Shift+R)
- [ ] Kiểm tra model xuất hiện trong dropdown với benchmark
- [ ] Test với 1 ảnh
- [ ] Test với "Test All Images"
- [ ] Xem kết quả benchmark trong dropdown

## 💡 Khuyến Nghị

### Model Nào Nên Tải?

**Bắt đầu với:**
- ✅ `paddleocr_v3` - Cân bằng tốt nhất
- ✅ `paddleocr_v4` - Mới nhất

**Nếu cần tốc độ:**
- ✅ `paddleocr_mobile_v2` - Nhanh, nhỏ gọn

**Nếu cần độ chính xác:**
- ✅ `paddleocr_server_v2` - Chính xác nhất (nhưng lớn)

### Thứ Tự Ưu Tiên

1. **PP-OCRv3** - Khuyến nghị cho hầu hết trường hợp
2. **PP-OCRv4** - Nếu muốn dùng công nghệ mới nhất
3. **PP-OCRv2 Mobile** - Nếu quan tâm kích thước/tốc độ
4. **PP-OCRv2 Server** - Nếu cần độ chính xác tuyệt đối

## 🔗 Tài Liệu Tham Khảo

- [PaddleOCR Official Repository](https://github.com/PaddlePaddle/PaddleOCR)
- [PaddleOCR Model List](https://github.com/PaddlePaddle/PaddleOCR/blob/main/doc/doc_en/models_list_en.md)
- [Paddle2ONNX Documentation](https://github.com/PaddlePaddle/Paddle2ONNX)
- [ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/)

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Xem phần "Xử Lý Lỗi" ở trên
2. Kiểm tra `scripts/README.md`
3. Xem logs trong browser console (F12)
4. Tạo issue trên GitHub repository

## 🎯 Tóm Tắt

```bash
# 1. Cài đặt tools
pip install paddle2onnx requests tqdm

# 2. Tải models
cd scripts
python3 download_models.py v3 v4

# 3. Kích hoạt trong config
# Đổi available: false → true

# 4. Restart server
python3 -m http.server 8000

# 5. Kiểm tra trong browser
# Mở http://localhost:8000
# Models sẽ tự động benchmark và hiển thị trong dropdown
```

---

**Lưu ý:** Tất cả models sử dụng chung dictionary `ppocr_keys_v1.txt` (6623 ký tự Trung Quốc).
