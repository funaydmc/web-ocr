# Web OCR System

Hệ thống OCR (Optical Character Recognition) sử dụng PaddleOCR với ONNX Runtime WebAssembly để nhận dạng văn bản tiếng Trung trong hình ảnh.

## 🎯 Tính năng chính

- **OCR Engine**: Sử dụng mô hình PaddleOCR recognition chạy trên ONNX Runtime WebAssembly
- **Multi-Model Support**: Hỗ trợ nhiều mô hình OCR với khả năng chuyển đổi linh hoạt
- **Statistics Tracking**: Theo dõi và so sánh độ chính xác, thời gian xử lý của từng mô hình
- **Model Comparison**: So sánh hiệu suất của nhiều mô hình cùng lúc
- **Web Interface**: Giao diện web đơn giản để test và hiển thị kết quả
- **Real-time Processing**: Xử lý nhanh với thời gian trung bình ~90ms/ảnh
- **Accuracy Comparison**: So sánh độ chính xác với ground truth ở mức ký tự
- **Batch Testing**: Test hàng loạt với tất cả ảnh test

## 📊 Các mô hình PaddleOCR có sẵn

Hệ thống hỗ trợ nhiều phiên bản mô hình PaddleOCR với đặc điểm khác nhau:

| Mô hình | Phiên bản | Kích thước | Tốc độ | Độ chính xác | Trạng thái |
|---------|-----------|------------|---------|--------------|------------|
| PaddleOCR v1 (Original) | 1.0 | 11 MB | Trung bình | 91.95% | ✅ Đang dùng |
| PP-OCRv2 Mobile | 2.0 | 8.5 MB | Nhanh | ~92% | 📥 Có thể tải |
| PP-OCRv2 Server | 2.0 | 94 MB | Chậm | ~95% | 📥 Có thể tải |
| PP-OCRv3 | 3.0 | 12 MB | Nhanh | ~93% | 📥 Có thể tải |
| PP-OCRv4 | 4.0 | 10 MB | Rất nhanh | ~94% | 📥 Có thể tải |

### Chọn mô hình phù hợp

- **PP-OCRv2 Mobile**: Phù hợp cho web/mobile, cần tốc độ và kích thước nhỏ
- **PP-OCRv2 Server**: Khi cần độ chính xác cao nhất, không quan tâm kích thước
- **PP-OCRv3**: Lựa chọn cân bằng tốt cho đa số trường hợp
- **PP-OCRv4**: Phiên bản mới nhất với công nghệ tiên tiến nhất

## 📊 Kết quả Test

### PaddleOCR v1 (Current Model)

- **Độ chính xác trung bình:** 91.95%
- **Thời gian xử lý trung bình:** 89.52ms/ảnh
- **Số ảnh khớp hoàn hảo:** 6/10 ảnh (100% accuracy)
- **Tổng số ký tự đúng:** 107/114

### Chi tiết từng ảnh test

| Ảnh | Độ chính xác | Thời gian | Ground Truth | OCR Result |
|-----|--------------|-----------|--------------|------------|
| test_01.png | 100% | ~200ms | 我们小区的楼房最高只有34层 | ✅ Exact match |
| test_02.png | 80% | ~81ms | 别去35楼 | 刷去35楼 |
| test_03.png | 80% | ~84ms | 陈杰, 这么晚了你怎么还不睡啊 | 陈杰，这么晚了你怎公还不睡啊 |
| test_04.png | 100% | ~75ms | 他刚刚确实短暂的发了会疯 | ✅ Exact match |
| test_05.png | 67% | ~75ms | 什么35楼啊 | 什235楼网 |
| test_06.png | 93% | ~75ms | 我听罢一股莫名的恐惧袭上心头 | 我听罢一股莫名的恐惧装上心头 |
| test_07.png | 100% | ~75ms | 我站在哥哥面前一动都不敢动 | ✅ Exact match |
| test_08.png | 100% | ~75ms | 喊完这句话以后 | ✅ Exact match |
| test_09.png | 100% | ~76ms | 但电梯突然多出一个35楼的按钮 | ✅ Exact match |
| test_10.png | 100% | ~78ms | 我站在哥哥面前一动都不敢动 | ✅ Exact match |

## 🚀 Cách sử dụng

### 1. Setup Nhanh với Script Tự Động (Khuyến nghị) ⭐

**Windows:**
```cmd
setup_models.bat
```

**Linux/macOS:**
```bash
chmod +x setup_models.sh
./setup_models.sh
```

Script sẽ tự động:
- ✅ Cài đặt dependencies
- ✅ Tải tất cả models (v2_mobile, v2_server, v3, v4)
- ✅ Chuyển đổi sang ONNX
- ✅ Hướng dẫn cập nhật config
- ✅ Khởi động server

📖 Xem chi tiết: [QUICK_SETUP.md](QUICK_SETUP.md)

### 2. Chạy local (Basic)

```bash
# Clone repository
git clone https://github.com/funaydmc/web-ocr.git
cd web-ocr

# Khởi động web server
python3 -m http.server 8000

# Mở browser tại http://localhost:8000
```

### 3. Sử dụng GitHub Pages

Website được deploy tự động lên GitHub Pages khi có thay đổi trên nhánh `main`.

URL: `https://funaydmc.github.io/web-ocr/`

### 4. Sử dụng giao diện

1. **Chọn Model**: Chọn mô hình OCR từ dropdown (hiển thị benchmark thực)
2. **Upload Ảnh**: Click "Choose Image" để chọn ảnh cần OCR
3. **Test All**: Click "Test All Images" để test trên tất cả ảnh test
4. **Compare Models**: Click "Compare All Models" để so sánh hiệu suất các mô hình

### 5. Tải và triển khai thêm các mô hình PaddleOCR

Hệ thống hỗ trợ nhiều phiên bản PaddleOCR models:

**Các model có sẵn để tải:**
- PP-OCRv2 Mobile (8.5MB) - Nhanh, nhẹ, phù hợp web/mobile
- PP-OCRv2 Server (94MB) - Độ chính xác cao nhất
- PP-OCRv3 (12MB) - Cân bằng tốc độ và độ chính xác
- PP-OCRv4 (10MB) - Phiên bản mới nhất, hiệu suất tốt nhất

**Cách tải models:**

```bash
# Cài đặt công cụ chuyển đổi
pip install paddle2onnx requests tqdm

# Tải tất cả models
cd scripts
python3 download_models.py

# Hoặc tải model cụ thể
python3 download_models.py v3 v4
```

Xem hướng dẫn chi tiết tại:
- [Hướng dẫn triển khai models](docs/MODEL_DEPLOYMENT_GUIDE.md) - Hướng dẫn đầy đủ
- [Thêm models mới](docs/ADDING_MODELS.md) - Hướng dẫn thêm model tùy chỉnh

## 📁 Cấu trúc thư mục

```
web-ocr/
├── index.html                 # Trang web chính
├── src/
│   ├── lib/
│   │   ├── ocr/              # Module OCR
│   │   │   ├── index.js      # Model loading, inference, CTC decode
│   │   │   ├── models-config.js  # Model configuration
│   │   │   └── statistics.js     # Statistics tracking
│   │   └── preprocess/       # Module tiền xử lý ảnh
│   └── web/
│       ├── main.js           # Logic ứng dụng chính
│       └── style.css         # Styling
├── static/
│   ├── models/               # ONNX models và dictionary
│   │   ├── rec_model.onnx   # Model nhận dạng văn bản
│   │   ├── det_model.onnx   # Model phát hiện vùng text
│   │   └── ppocr_keys_v1.txt # Dictionary 6623 ký tự
│   ├── tests/                # Ảnh test và ground truth
│   │   ├── test_01.png - test_10.png
│   │   └── ground_truth.json
│   └── lib/                  # ONNX Runtime WebAssembly
├── docs/
│   └── ADDING_MODELS.md     # Hướng dẫn thêm model mới
└── .github/
    └── workflows/
        └── deploy.yml        # GitHub Actions workflow
```

## 🛠️ Công nghệ sử dụng

- **ONNX Runtime Web 1.17.0**: Chạy mô hình ONNX trên browser qua WebAssembly
- **Paddle Lite WebAssembly**: Hỗ trợ chạy mô hình Paddle Lite (.nb) được tối ưu cho web/mobile
- **PaddleOCR**: Mô hình OCR recognition từ PaddlePaddle
- **Vanilla JavaScript**: Không sử dụng framework, chỉ JavaScript thuần
- **HTML5 Canvas**: Xử lý và hiển thị ảnh
- **ES6 Modules**: Module system hiện đại cho JavaScript

## 🎨 Tính năng mới

### Model Selection
- Chọn model từ dropdown để thay đổi mô hình OCR
- Hỗ trợ cả ONNX models (.onnx) và Paddle Lite models (.nb)
- Tự động load model khi chuyển đổi
- Hiển thị tên model trong kết quả

### Statistics Tracking
- Theo dõi độ chính xác của từng model
- Tính thời gian xử lý trung bình
- Đếm số lần test và perfect matches
- Lưu trữ lịch sử test results

### Model Comparison
- So sánh nhiều model cùng lúc
- Hiển thị bảng so sánh với ranking
- Sắp xếp theo độ chính xác
- Export statistics sang JSON

### Paddle Lite Support
- Hỗ trợ mô hình Paddle Lite (.nb) tối ưu cho web
- Chuyển đổi tự động giữa định dạng NCHW và NHWC
- Hiệu suất cao hơn với models được tối ưu
- Kích thước file nhỏ hơn 30-50% so với ONNX

## 📖 Chi tiết kỹ thuật

### Preprocessing
- Resize ảnh về 320x48 pixels (width x height)
- Chuẩn hóa giá trị pixel về [0.0, 1.0]
- Chuyển đổi từ HWC sang CHW format
- Thêm batch dimension: [1, 3, 48, 320]

### OCR Recognition
- Input: Tensor float32 [1, 3, 48, 320]
- Output: Tensor float32 [1, 40, 6625] (40 time steps, 6625 classes)
- Sử dụng argmax để lấy class indices
- CTC decoding để loại bỏ blank tokens và duplicates

### Character Mapping
- Dictionary: 6623 ký tự tiếng Trung (simplified & traditional)
- Index 0: blank token (CTC)
- Index 1-6623: ký tự từ ppocr_keys_v1.txt

## 📝 GitHub Actions

Repository sử dụng GitHub Actions để tự động deploy lên GitHub Pages khi có thay đổi trên nhánh `main`.

Workflow file: `.github/workflows/deploy.yml`

## 🔍 Độ chính xác

Hệ thống đạt độ chính xác cao trên bộ test (PaddleOCR v1):
- test_01.png: 100% - "我们小区的楼房最高只有34层"
- test_02.png: 80% - "别去35楼" (OCR: "刷去35楼")
- test_03.png: 80% - "陈杰, 这么晚了你怎么还不睡啊"
- test_04.png: 100% - "他刚刚确实短暂的发了会疯"
- test_05.png: 67% - "什么35楼啊" (OCR: "什235楼网")
- test_06.png: 93% - "我听罢一股莫名的恐惧袭上心头"
- test_07.png: 100% - "我站在哥哥面前一动都不敢动"
- test_08.png: 100% - "喊完这句话以后"
- test_09.png: 100% - "但电梯突然多出一个35楼的按钮"
- test_10.png: 100% - "我站在哥哥面前一动都不敢动"

## 📸 Screenshots

### Giao diện chính
![Web OCR Interface](https://github.com/user-attachments/assets/2a0a14b0-d3ca-4c8b-88eb-74b08bb087d7)

### Kết quả Test All Images
![Test Results](https://github.com/user-attachments/assets/dc9685ae-14eb-45d4-aa72-4bf0dd09f2b8)

## 📄 License

Dự án này sử dụng các mô hình từ PaddleOCR và ONNX Runtime Web.

## 👨‍💻 Author

Developed as part of OCR implementation project.
