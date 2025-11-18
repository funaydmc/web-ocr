# PaddleOCR Model Download Scripts

Các script để tải và triển khai các mô hình PaddleOCR khác nhau.

## 📁 Scripts Available

### 1. download_models.py (Khuyến nghị)

Script Python để tải và chuyển đổi mô hình PaddleOCR.

**Yêu cầu:**
```bash
pip install paddle2onnx requests tqdm
```

**Sử dụng:**
```bash
# Liệt kê các model có sẵn
python3 download_models.py --list

# Tải tất cả models
python3 download_models.py

# Tải model cụ thể
python3 download_models.py v3
python3 download_models.py v3 v4

# Tải PP-OCRv2 Mobile (nhanh, nhẹ)
python3 download_models.py v2_mobile

# Tải PP-OCRv2 Server (độ chính xác cao)
python3 download_models.py v2_server
```

**Tính năng:**
- ✅ Tự động tải model từ PaddleOCR repository
- ✅ Chuyển đổi sang định dạng ONNX
- ✅ Thanh tiến trình (progress bar)
- ✅ Xử lý lỗi tốt
- ✅ Dọn dẹp file tạm tự động

### 2. download_models.sh

Script Bash thay thế (nếu không muốn dùng Python).

**Yêu cầu:**
```bash
# wget hoặc curl
# paddle2onnx
pip install paddle2onnx
```

**Sử dụng:**
```bash
# Tải tất cả models
./download_models.sh all

# Tải model cụ thể
./download_models.sh v3
./download_models.sh v2_mobile
./download_models.sh v2_server
./download_models.sh v4
```

## 🚀 Quy trình triển khai

### Bước 1: Cài đặt công cụ

```bash
pip install paddle2onnx requests tqdm
```

### Bước 2: Chạy script tải model

```bash
cd scripts
python3 download_models.py v3 v4
```

Output:
```
============================================================
Processing: PP-OCRv3
Description: Latest stable version with improved accuracy
Size: 12 MB
============================================================

Downloading from: https://paddleocr.bj.bcebos.com/...
rec_v3.onnx: 100%|████████████| 12.0M/12.0M [00:05<00:00, 2.1MB/s]
Extracting ch_PP-OCRv3_rec_infer.tar...
Converting to ONNX format...
✓ Converted successfully: ../static/models/rec_v3.onnx

✓ PP-OCRv3 ready!
  Location: ../static/models/rec_v3.onnx
```

### Bước 3: Kích hoạt model

Mở file `src/lib/ocr/models-config.js` và đổi `available: false` thành `available: true`:

```javascript
'paddleocr_v3': {
    id: 'paddleocr_v3',
    name: 'PP-OCRv3',
    // ... các config khác
    available: true  // Đổi từ false sang true
}
```

### Bước 4: Restart web server

```bash
# Dừng server hiện tại (Ctrl+C)
# Khởi động lại
python3 -m http.server 8000
```

### Bước 5: Test model

1. Mở browser tại `http://localhost:8000`
2. Chọn model từ dropdown "OCR Model"
3. Upload ảnh để test
4. Hoặc click "Test All Images" để test trên 10 ảnh
5. Click "Compare All Models" để so sánh các models

## 📊 Model Information

### PP-OCRv2 Mobile
- **File**: `rec_mobile_v2.onnx`
- **Size**: 8.5 MB
- **Pros**: Nhỏ gọn, nhanh, phù hợp web/mobile
- **Cons**: Độ chính xác thấp hơn server model
- **Use case**: Khi cần tốc độ và kích thước nhỏ

### PP-OCRv2 Server
- **File**: `rec_server_v2.onnx`
- **Size**: 94 MB
- **Pros**: Độ chính xác cao nhất
- **Cons**: Kích thước lớn, chậm hơn
- **Use case**: Khi cần độ chính xác tối đa

### PP-OCRv3
- **File**: `rec_v3.onnx`
- **Size**: 12 MB
- **Pros**: Cân bằng tốc độ và độ chính xác
- **Cons**: -
- **Use case**: Lựa chọn tốt cho đa số trường hợp

### PP-OCRv4
- **File**: `rec_v4.onnx`
- **Size**: 10 MB
- **Pros**: Công nghệ mới nhất, hiệu suất tốt
- **Cons**: Mới nhất nên có ít tài liệu hơn
- **Use case**: Muốn dùng công nghệ tiên tiến nhất

## 🐛 Troubleshooting

### Lỗi: paddle2onnx not found

```bash
pip install paddle2onnx
```

### Lỗi: requests/tqdm not found

```bash
pip install requests tqdm
```

### Lỗi: Cannot download file

- Kiểm tra kết nối internet
- Thử lại sau vài phút
- Sử dụng VPN nếu site bị chặn
- Tải thủ công từ browser và chuyển đổi

### Lỗi: Model không xuất hiện trong dropdown

- Kiểm tra `available: true` trong models-config.js
- Xóa cache browser (Ctrl+Shift+R)
- Restart web server
- Kiểm tra file model có tồn tại trong static/models/

### Lỗi: Out of memory

- Sử dụng mobile models thay vì server models
- Đóng các tab browser khác
- Test từng model một, không test tất cả cùng lúc

## 📚 Tài liệu tham khảo

- [PaddleOCR Official](https://github.com/PaddlePaddle/PaddleOCR)
- [Model List](https://github.com/PaddlePaddle/PaddleOCR/blob/main/doc/doc_en/models_list_en.md)
- [Deployment Guide](https://github.com/PaddlePaddle/PaddleOCR/blob/main/deploy/README.md)
- [Lite Deployment](https://github.com/PaddlePaddle/PaddleOCR/blob/main/deploy/lite/readme_en.md)

## 🔗 Download Links

### Direct Download URLs

```
PP-OCRv2 Mobile:
https://paddleocr.bj.bcebos.com/PP-OCRv2/chinese/ch_PP-OCRv2_rec_infer.tar

PP-OCRv2 Server:
https://paddleocr.bj.bcebos.com/PP-OCRv2/chinese/ch_PP-OCRv2_rec_server_infer.tar

PP-OCRv3:
https://paddleocr.bj.bcebos.com/PP-OCRv3/chinese/ch_PP-OCRv3_rec_infer.tar

PP-OCRv4:
https://paddleocr.bj.bcebos.com/PP-OCRv4/chinese/ch_PP-OCRv4_rec_infer.tar
```

## 💡 Tips

1. **Bắt đầu với v3**: PP-OCRv3 là lựa chọn cân bằng tốt nhất
2. **Test local trước**: Kiểm tra model hoạt động trước khi deploy production
3. **So sánh models**: Dùng nút "Compare All Models" để tìm model phù hợp nhất
4. **Chọn model theo use case**: 
   - Mobile model cho web/mobile
   - Server model cho độ chính xác cao
   - v3/v4 cho cân bằng
5. **Monitor performance**: Theo dõi metrics để đảm bảo hiệu suất tốt

## ✅ Checklist

Trước khi deploy model mới:

- [ ] Cài đặt paddle2onnx, requests, tqdm
- [ ] Chạy script download
- [ ] Kiểm tra file .onnx được tạo trong static/models/
- [ ] Cập nhật models-config.js (available: true)
- [ ] Restart web server
- [ ] Xóa cache browser
- [ ] Kiểm tra model xuất hiện trong dropdown
- [ ] Test với 1 ảnh
- [ ] Test với tất cả ảnh (Test All Images)
- [ ] So sánh với models khác (Compare All Models)
- [ ] Ghi lại kết quả

## 📞 Hỗ trợ

Nếu gặp vấn đề:

1. Đọc phần Troubleshooting ở trên
2. Kiểm tra [Model Deployment Guide](../docs/MODEL_DEPLOYMENT_GUIDE.md)
3. Xem [Adding Models Guide](../docs/ADDING_MODELS.md)
4. Tạo issue trên GitHub repository
