# 🚀 Quick Setup Guide

## Automated Setup Scripts

Chúng tôi cung cấp 2 scripts tự động để thiết lập toàn bộ hệ thống:

### Windows

```cmd
setup_models.bat
```

### Linux / macOS

```bash
chmod +x setup_models.sh
./setup_models.sh
```

## Script Thực Hiện Các Bước Sau

1. ✅ **Cài đặt dependencies** (`paddle2onnx`, `requests`, `tqdm`)
2. ✅ **Tải xuống tất cả PaddleOCR models** (v2_mobile, v2_server, v3, v4)
3. ✅ **Chuyển đổi models** từ PaddlePaddle → ONNX
4. ✅ **Kiểm tra model files** đã được tạo
5. ✅ **Hướng dẫn cập nhật config** (`src/lib/ocr/models-config.js`)
6. ✅ **Khởi động web server** tự động

## Yêu Cầu Hệ Thống

- Python 3.8 hoặc cao hơn
- Kết nối internet (để tải models)
- Ít nhất 150 MB dung lượng trống

## Sử Dụng Nhanh

### Cách 1: Setup Tự Động (Khuyến Nghị)

**Windows:**
```cmd
setup_models.bat
```

**Linux/macOS:**
```bash
./setup_models.sh
```

Script sẽ tự động thực hiện tất cả các bước và khởi động server.

### Cách 2: Setup Thủ Công

Nếu bạn muốn kiểm soát từng bước:

```bash
# Bước 1: Cài đặt dependencies
pip install paddle2onnx requests tqdm

# Bước 2: Tải models
cd scripts
python3 download_models.py

# Bước 3: Cập nhật config
# Mở src/lib/ocr/models-config.js
# Đổi available: false → available: true

# Bước 4: Khởi động server
python3 -m http.server 8000
```

## Sau Khi Setup

### Kiểm Tra Models

Mở browser tại `http://localhost:8000`

Model dropdown sẽ hiển thị:
```
✓ PaddleOCR v1 (Original) [86.67% | 103ms]
✓ PP-OCRv2 Mobile [89.50% | 85ms]
✓ PP-OCRv3 [92.50% | 95ms]
✓ PP-OCRv4 [94.00% | 88ms]
```

### Test Models

1. **Test 1 ảnh**: Chọn model từ dropdown, upload ảnh
2. **Test All Images**: Click nút "🧪 Test All Images" để test tất cả models
3. **Compare Models**: Click "📊 Compare All Models" để so sánh

## Cấu Trúc Files Sau Setup

```
web-ocr/
├── static/
│   └── models/
│       ├── rec_model.onnx          # PaddleOCR v1 (11 MB) ✓
│       ├── rec_mobile_v2.onnx      # PP-OCRv2 Mobile (8.5 MB) ✓
│       ├── rec_server_v2.onnx      # PP-OCRv2 Server (94 MB) ✓
│       ├── rec_v3.onnx             # PP-OCRv3 (12 MB) ✓
│       ├── rec_v4.onnx             # PP-OCRv4 (10 MB) ✓
│       └── ppocr_keys_v1.txt       # Dictionary
├── scripts/
│   ├── download_models.py          # Model downloader
│   └── README.md
├── setup_models.bat                # Windows setup script ⭐
├── setup_models.sh                 # Linux/Mac setup script ⭐
└── ADDING_MODELS_GUIDE.md          # Detailed guide
```

## Xử Lý Lỗi

### Lỗi: "Python not found"

**Windows:**
- Cài đặt Python từ https://www.python.org/
- Chọn "Add Python to PATH" khi cài đặt

**Linux:**
```bash
sudo apt-get install python3 python3-pip
```

**macOS:**
```bash
brew install python3
```

### Lỗi: "Failed to download models"

- Kiểm tra kết nối internet
- Thử lại: `cd scripts && python3 download_models.py`
- Nếu vẫn lỗi, tải thủ công từ [PaddleOCR Models](https://github.com/PaddlePaddle/PaddleOCR/blob/main/doc/doc_en/models_list_en.md)

### Lỗi: "paddle2onnx not found"

```bash
pip install --user paddle2onnx
# hoặc
pip3 install --user paddle2onnx
```

### Models không xuất hiện trong dropdown

1. Kiểm tra file model tồn tại:
   ```bash
   ls -la static/models/
   ```

2. Kiểm tra config đã cập nhật:
   ```bash
   grep "available: true" src/lib/ocr/models-config.js
   ```

3. Xóa cache browser: `Ctrl+Shift+R` (Windows) hoặc `Cmd+Shift+R` (Mac)

4. Restart server

## Tính Năng Tự Động

### Automatic Benchmarking

Khi server khởi động:
- Tự động load tất cả models có `available: true`
- Chạy benchmark với 3 ảnh test đầu tiên
- Tính toán accuracy và processing time
- Hiển thị kết quả trong dropdown

### Benchmark Format

```
✓ Model Name [accuracy% | time ms] - Description
```

Ví dụ:
```
✓ PP-OCRv3 [92.50% | 95ms] - Latest stable version
```

## So Sánh Models

| Model | Accuracy | Speed | Size | Use Case |
|-------|----------|-------|------|----------|
| v1 Original | 86.67% | 103ms | 11 MB | Baseline |
| v2 Mobile | ~89% | ~85ms | 8.5 MB | Web/Mobile |
| v2 Server | ~95% | ~120ms | 94 MB | High accuracy |
| v3 | ~92% | ~95ms | 12 MB | Balanced ⭐ |
| v4 | ~94% | ~88ms | 10 MB | Latest ⭐ |

**Khuyến nghị:**
- Bắt đầu với **PP-OCRv3** (cân bằng tốt nhất)
- Nếu cần nhanh: **PP-OCRv2 Mobile**
- Nếu cần chính xác: **PP-OCRv2 Server**
- Công nghệ mới nhất: **PP-OCRv4**

## Khởi Động Lại Server

```bash
# Dừng server: Ctrl+C

# Khởi động lại
python3 -m http.server 8000

# Hoặc chạy lại setup script
./setup_models.sh
```

## Advanced: Chỉ Tải Models Cụ Thể

```bash
cd scripts

# Chỉ tải v3
python3 download_models.py v3

# Tải v3 và v4
python3 download_models.py v3 v4

# Tải mobile model (nhỏ, nhanh)
python3 download_models.py v2_mobile

# Xem danh sách
python3 download_models.py --list
```

## Tài Liệu Chi Tiết

- **`ADDING_MODELS_GUIDE.md`** - Hướng dẫn chi tiết bằng tiếng Việt
- **`scripts/README.md`** - Tài liệu về download script
- **`README.md`** - Tổng quan dự án

## Checklist Setup

- [ ] Cài đặt Python 3.8+
- [ ] Chạy `setup_models.bat` (Windows) hoặc `setup_models.sh` (Linux/Mac)
- [ ] Đợi models tải xong (~125 MB)
- [ ] Cập nhật `available: true` trong `models-config.js`
- [ ] Khởi động server thành công
- [ ] Kiểm tra models xuất hiện trong dropdown với benchmark
- [ ] Test với 1 ảnh
- [ ] Test với "Test All Images"
- [ ] Xem kết quả benchmark

## Hỗ Trợ

Nếu gặp vấn đề:

1. Đọc phần "Xử Lý Lỗi" ở trên
2. Kiểm tra logs trong terminal/cmd
3. Xem console trong browser (F12)
4. Tham khảo `ADDING_MODELS_GUIDE.md`
5. Tạo issue trên GitHub

## Thời Gian Setup

- **Setup tự động**: ~5-10 phút (tùy tốc độ mạng)
- **Tải models**: ~3-5 phút (125 MB)
- **Chuyển đổi**: ~1-2 phút
- **Cấu hình**: ~1 phút

**Tổng**: ~10-15 phút để setup hoàn chỉnh

---

**Bắt đầu ngay:**

```bash
# Windows
setup_models.bat

# Linux/Mac
./setup_models.sh
```

🎉 Enjoy your multi-model OCR system!
