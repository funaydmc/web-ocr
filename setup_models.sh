#!/bin/bash
# ================================================================
# Web OCR - Complete Model Setup Script (Linux/Mac)
# ================================================================
# This script will:
#   1. Install required dependencies
#   2. Download all PaddleOCR models
#   3. Convert models to ONNX format
#   4. Guide you to update configuration
#   5. Start the web server
# ================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "================================================================"
echo "Web OCR - Model Setup Script"
echo "================================================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} Python 3 is not installed"
    echo "Please install Python 3.8+ from https://www.python.org/"
    exit 1
fi

PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo -e "${GREEN}[OK]${NC} Python ${PYTHON_VERSION} found"
echo ""

# Step 1: Install dependencies
echo "[Step 1/5] Installing dependencies..."
echo "----------------------------------------------------------------"
pip3 install paddle2onnx requests tqdm || pip3 install --user paddle2onnx requests tqdm
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR]${NC} Failed to install dependencies"
    exit 1
fi
echo -e "${GREEN}[OK]${NC} Dependencies installed successfully"
echo ""

# Step 2: Download and convert models
echo "[Step 2/5] Downloading and converting models..."
echo "----------------------------------------------------------------"
echo "This will download all PaddleOCR models (v2_mobile, v2_server, v3, v4)"
echo "Total download size: ~125 MB"
echo ""
read -p "Continue? (Y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled"
    exit 0
fi

cd scripts
python3 download_models.py
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR]${NC} Model download/conversion failed"
    echo "Please check your internet connection and try again"
    cd ..
    exit 1
fi
cd ..
echo -e "${GREEN}[OK]${NC} Models downloaded and converted successfully"
echo ""

# Step 3: Verify model files
echo "[Step 3/5] Verifying model files..."
echo "----------------------------------------------------------------"
MODEL_DIR="static/models"
FOUND_MODELS=0

if [ -f "${MODEL_DIR}/rec_model.onnx" ]; then
    echo -e "${GREEN}[OK]${NC} PaddleOCR v1: rec_model.onnx"
    ((FOUND_MODELS++))
fi

if [ -f "${MODEL_DIR}/rec_mobile_v2.onnx" ]; then
    echo -e "${GREEN}[OK]${NC} PP-OCRv2 Mobile: rec_mobile_v2.onnx"
    ((FOUND_MODELS++))
fi

if [ -f "${MODEL_DIR}/rec_server_v2.onnx" ]; then
    echo -e "${GREEN}[OK]${NC} PP-OCRv2 Server: rec_server_v2.onnx"
    ((FOUND_MODELS++))
fi

if [ -f "${MODEL_DIR}/rec_v3.onnx" ]; then
    echo -e "${GREEN}[OK]${NC} PP-OCRv3: rec_v3.onnx"
    ((FOUND_MODELS++))
fi

if [ -f "${MODEL_DIR}/rec_v4.onnx" ]; then
    echo -e "${GREEN}[OK]${NC} PP-OCRv4: rec_v4.onnx"
    ((FOUND_MODELS++))
fi

echo ""
echo "Found ${FOUND_MODELS} model(s)"
echo ""

# Step 4: Configuration update
echo "[Step 4/5] Configuration Update Required"
echo "----------------------------------------------------------------"
echo -e "${YELLOW}IMPORTANT:${NC} You need to manually update the configuration file:"
echo ""
echo "File: src/lib/ocr/models-config.js"
echo ""
echo "For each downloaded model, change:"
echo "    available: false  -->  available: true"
echo ""
echo "Models to update:"
[ -f "${MODEL_DIR}/rec_mobile_v2.onnx" ] && echo "  - paddleocr_mobile_v2"
[ -f "${MODEL_DIR}/rec_server_v2.onnx" ] && echo "  - paddleocr_server_v2"
[ -f "${MODEL_DIR}/rec_v3.onnx" ] && echo "  - paddleocr_v3"
[ -f "${MODEL_DIR}/rec_v4.onnx" ] && echo "  - paddleocr_v4"
echo ""

# Option to open editor
echo "Would you like to:"
echo "  1) Open the config file now (if editor available)"
echo "  2) Skip and edit manually later"
read -p "Choose (1/2): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[1]$ ]]; then
    CONFIG_FILE="src/lib/ocr/models-config.js"
    if command -v nano &> /dev/null; then
        nano "$CONFIG_FILE"
    elif command -v vim &> /dev/null; then
        vim "$CONFIG_FILE"
    elif command -v vi &> /dev/null; then
        vi "$CONFIG_FILE"
    else
        echo -e "${YELLOW}[WARN]${NC} No text editor found. Please edit manually:"
        echo "    $CONFIG_FILE"
    fi
fi

read -p "Press Enter when you've updated the configuration file..."
echo ""

# Step 5: Start web server
echo "[Step 5/5] Starting Web Server"
echo "----------------------------------------------------------------"
echo -e "${BLUE}The web server will start on http://localhost:8000${NC}"
echo ""
echo "Features:"
echo "  - All available models will be automatically benchmarked"
echo "  - Benchmark results will appear in the model dropdown"
echo "  - Use 'Test All Images' to test all models"
echo "  - Use 'Compare All Models' to see model comparison"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""
read -p "Press Enter to start the server..."

python3 -m http.server 8000

echo ""
echo "================================================================"
echo "Setup Complete!"
echo "================================================================"
echo ""
echo "To restart the server later, run:"
echo "    python3 -m http.server 8000"
echo ""
echo "For help, see:"
echo "    - ADDING_MODELS_GUIDE.md"
echo "    - scripts/README.md"
echo ""
