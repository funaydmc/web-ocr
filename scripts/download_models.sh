#!/bin/bash

###############################################################################
# PaddleOCR Model Download Script
# 
# This script downloads various PaddleOCR models and converts them to ONNX format
# for use in the Web OCR system.
#
# Usage: ./download_models.sh [model_name]
#   - If no model_name provided, downloads all available models
#   - Supported models: v2_mobile, v2_server, v3, v4
#
# Requirements:
#   - wget or curl
#   - paddle2onnx (for ONNX conversion)
#   - tar
#
# Based on: https://github.com/PaddlePaddle/PaddleOCR/blob/main/doc/doc_en/models_list_en.md
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
MODELS_DIR="../static/models"
TEMP_DIR="/tmp/paddleocr_downloads"

# Create directories
mkdir -p "$MODELS_DIR"
mkdir -p "$TEMP_DIR"

echo -e "${GREEN}=== PaddleOCR Model Download Script ===${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to download file
download_file() {
    local url="$1"
    local output="$2"
    
    echo -e "${YELLOW}Downloading from: ${url}${NC}"
    
    if command_exists wget; then
        wget -q --show-progress -O "$output" "$url"
    elif command_exists curl; then
        curl -L -o "$output" "$url" --progress-bar
    else
        echo -e "${RED}Error: Neither wget nor curl found${NC}"
        exit 1
    fi
}

# Function to convert PaddlePaddle model to ONNX
convert_to_onnx() {
    local model_dir="$1"
    local output_name="$2"
    
    echo -e "${YELLOW}Converting to ONNX format...${NC}"
    
    if ! command_exists paddle2onnx; then
        echo -e "${RED}Error: paddle2onnx not found${NC}"
        echo "Install with: pip install paddle2onnx"
        exit 1
    fi
    
    paddle2onnx \
        --model_dir "$model_dir" \
        --model_filename inference.pdmodel \
        --params_filename inference.pdiparams \
        --save_file "$MODELS_DIR/$output_name" \
        --opset_version 11 \
        --enable_onnx_checker True
    
    echo -e "${GREEN}✓ Converted to: $MODELS_DIR/$output_name${NC}"
}

# Download PP-OCRv2 Mobile (Lightweight)
download_v2_mobile() {
    echo -e "\n${GREEN}=== Downloading PP-OCRv2 Mobile ===${NC}"
    local url="https://paddleocr.bj.bcebos.com/PP-OCRv2/chinese/ch_PP-OCRv2_rec_infer.tar"
    local tar_file="$TEMP_DIR/ch_PP-OCRv2_rec_infer.tar"
    
    download_file "$url" "$tar_file"
    
    cd "$TEMP_DIR"
    tar -xf ch_PP-OCRv2_rec_infer.tar
    
    convert_to_onnx "ch_PP-OCRv2_rec_infer" "rec_mobile_v2.onnx"
    
    echo -e "${GREEN}✓ PP-OCRv2 Mobile downloaded and converted${NC}"
}

# Download PP-OCRv2 Server (High Accuracy)
download_v2_server() {
    echo -e "\n${GREEN}=== Downloading PP-OCRv2 Server ===${NC}"
    local url="https://paddleocr.bj.bcebos.com/PP-OCRv2/chinese/ch_PP-OCRv2_rec_server_infer.tar"
    local tar_file="$TEMP_DIR/ch_PP-OCRv2_rec_server_infer.tar"
    
    download_file "$url" "$tar_file"
    
    cd "$TEMP_DIR"
    tar -xf ch_PP-OCRv2_rec_server_infer.tar
    
    convert_to_onnx "ch_PP-OCRv2_rec_server_infer" "rec_server_v2.onnx"
    
    echo -e "${GREEN}✓ PP-OCRv2 Server downloaded and converted${NC}"
}

# Download PP-OCRv3 (Latest Stable)
download_v3() {
    echo -e "\n${GREEN}=== Downloading PP-OCRv3 ===${NC}"
    local url="https://paddleocr.bj.bcebos.com/PP-OCRv3/chinese/ch_PP-OCRv3_rec_infer.tar"
    local tar_file="$TEMP_DIR/ch_PP-OCRv3_rec_infer.tar"
    
    download_file "$url" "$tar_file"
    
    cd "$TEMP_DIR"
    tar -xf ch_PP-OCRv3_rec_infer.tar
    
    convert_to_onnx "ch_PP-OCRv3_rec_infer" "rec_v3.onnx"
    
    echo -e "${GREEN}✓ PP-OCRv3 downloaded and converted${NC}"
}

# Download PP-OCRv4 (Newest)
download_v4() {
    echo -e "\n${GREEN}=== Downloading PP-OCRv4 ===${NC}"
    local url="https://paddleocr.bj.bcebos.com/PP-OCRv4/chinese/ch_PP-OCRv4_rec_infer.tar"
    local tar_file="$TEMP_DIR/ch_PP-OCRv4_rec_infer.tar"
    
    download_file "$url" "$tar_file"
    
    cd "$TEMP_DIR"
    tar -xf ch_PP-OCRv4_rec_infer.tar
    
    convert_to_onnx "ch_PP-OCRv4_rec_infer" "rec_v4.onnx"
    
    echo -e "${GREEN}✓ PP-OCRv4 downloaded and converted${NC}"
}

# Main execution
case "${1:-all}" in
    v2_mobile)
        download_v2_mobile
        ;;
    v2_server)
        download_v2_server
        ;;
    v3)
        download_v3
        ;;
    v4)
        download_v4
        ;;
    all)
        download_v2_mobile
        download_v2_server
        download_v3
        download_v4
        ;;
    *)
        echo -e "${RED}Invalid model name: $1${NC}"
        echo "Usage: $0 [v2_mobile|v2_server|v3|v4|all]"
        exit 1
        ;;
esac

# Cleanup
echo -e "\n${YELLOW}Cleaning up temporary files...${NC}"
rm -rf "$TEMP_DIR"

echo -e "\n${GREEN}=== Download Complete! ===${NC}"
echo ""
echo "Models saved to: $MODELS_DIR"
echo ""
echo "Next steps:"
echo "1. Update src/lib/ocr/models-config.js to enable the new models"
echo "2. Refresh the web interface"
echo "3. Select models from the dropdown to test"
echo ""
echo -e "${GREEN}Model Information:${NC}"
echo "  • v2_mobile: Fast and lightweight, suitable for mobile/web"
echo "  • v2_server: Higher accuracy, larger model size"
echo "  • v3: Latest stable version with improved accuracy"
echo "  • v4: Newest version with best performance"
