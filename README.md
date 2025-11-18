# Web OCR System

Hệ thống OCR (Optical Character Recognition) sử dụng PaddleOCR với ONNX Runtime WebAssembly để nhận dạng văn bản tiếng Trung trong hình ảnh.

## 🎯 Tính năng chính

- **OCR Engine**: Sử dụng mô hình PaddleOCR recognition chạy trên ONNX Runtime WebAssembly
- **Web Interface**: Giao diện web đơn giản để test và hiển thị kết quả
- **Real-time Processing**: Xử lý nhanh với thời gian trung bình ~77ms/ảnh
- **Accuracy Comparison**: So sánh độ chính xác với ground truth ở mức ký tự
- **Batch Testing**: Test hàng loạt với tất cả ảnh test

## 📊 Kết quả Test

- **Độ chính xác trung bình:** 91.95%
- **Thời gian xử lý trung bình:** 84.39ms/ảnh
- **Số ảnh khớp hoàn hảo:** 6/10 ảnh (100% accuracy)
- **Tổng số ký tự đúng:** 107/114

### Cải tiến Preprocessing
- Sử dụng `imageSmoothingQuality = 'high'` cho chất lượng nội suy tốt hơn
- Giảm thiểu hiện tượng răng cưa (aliasing) khi resize ảnh

## 🚀 Cách sử dụng

### 1. Chạy local

```bash
# Clone repository
git clone https://github.com/funaydmc/web-ocr.git
cd web-ocr

# Khởi động web server
python3 -m http.server 8000

# Mở browser tại http://localhost:8000
```

### 2. Sử dụng GitHub Pages

Website được deploy tự động lên GitHub Pages khi có thay đổi trên nhánh `main`.

URL: `https://funaydmc.github.io/web-ocr/`

## 📁 Cấu trúc thư mục

```
web-ocr/
├── index.html                 # Trang web chính
├── src/
│   ├── lib/
│   │   ├── ocr/              # Module OCR (model loading, inference, CTC decode)
│   │   └── preprocess/       # Module tiền xử lý ảnh
│   └── web/
│       ├── main.js           # Logic ứng dụng chính
│       └── style.css         # Styling
├── static/
│   ├── models/               # ONNX models và dictionary
│   │   ├── rec_model.onnx   # Model nhận dạng văn bản
│   │   └── ppocr_keys_v1.txt # Dictionary 6623 ký tự
│   ├── tests/                # Ảnh test và ground truth
│   │   ├── test_01.png - test_10.png
│   │   └── ground_truth.json
│   └── lib/                  # ONNX Runtime WebAssembly
└── .github/
    └── workflows/
        └── deploy.yml        # GitHub Actions workflow
```

## 🛠️ Công nghệ sử dụng

- **ONNX Runtime Web 1.17.0**: Chạy mô hình ONNX trên browser qua WebAssembly
- **PaddleOCR**: Mô hình OCR recognition từ PaddlePaddle
- **Vanilla JavaScript**: Không sử dụng framework, chỉ JavaScript thuần
- **HTML5 Canvas**: Xử lý và hiển thị ảnh

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

Hệ thống đạt độ chính xác cao trên bộ test:
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

## 📄 License

Dự án này sử dụng các mô hình từ PaddleOCR và ONNX Runtime Web.

## 👨‍💻 Author

Developed as part of OCR implementation project.
