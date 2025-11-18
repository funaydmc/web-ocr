@echo off
REM ================================================================
REM Web OCR - Complete Model Setup Script (Windows)
REM ================================================================
REM This script will:
REM   1. Install required dependencies
REM   2. Download all PaddleOCR models
REM   3. Convert models to ONNX format
REM   4. Guide you to update configuration
REM ================================================================

echo ================================================================
echo Web OCR - Model Setup Script
echo ================================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)

echo [Step 1/5] Installing dependencies...
echo ----------------------------------------------------------------
pip install paddle2onnx requests tqdm
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed successfully
echo.

echo [Step 2/5] Downloading and converting models...
echo ----------------------------------------------------------------
echo This will download all PaddleOCR models (v2_mobile, v2_server, v3, v4)
echo Total download size: ~125 MB
echo.
set /p CONFIRM="Continue? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo Setup cancelled
    pause
    exit /b 0
)

cd scripts
python download_models.py
if errorlevel 1 (
    echo [ERROR] Model download/conversion failed
    echo Please check your internet connection and try again
    cd ..
    pause
    exit /b 1
)
cd ..
echo [OK] Models downloaded and converted successfully
echo.

echo [Step 3/5] Verifying model files...
echo ----------------------------------------------------------------
set MODEL_DIR=static\models
set FOUND_MODELS=0

if exist "%MODEL_DIR%\rec_model.onnx" (
    echo [OK] PaddleOCR v1: rec_model.onnx
    set /a FOUND_MODELS+=1
)

if exist "%MODEL_DIR%\rec_mobile_v2.onnx" (
    echo [OK] PP-OCRv2 Mobile: rec_mobile_v2.onnx
    set /a FOUND_MODELS+=1
)

if exist "%MODEL_DIR%\rec_server_v2.onnx" (
    echo [OK] PP-OCRv2 Server: rec_server_v2.onnx
    set /a FOUND_MODELS+=1
)

if exist "%MODEL_DIR%\rec_v3.onnx" (
    echo [OK] PP-OCRv3: rec_v3.onnx
    set /a FOUND_MODELS+=1
)

if exist "%MODEL_DIR%\rec_v4.onnx" (
    echo [OK] PP-OCRv4: rec_v4.onnx
    set /a FOUND_MODELS+=1
)

echo.
echo Found %FOUND_MODELS% model(s)
echo.

echo [Step 4/5] Configuration Update Required
echo ----------------------------------------------------------------
echo IMPORTANT: You need to manually update the configuration file:
echo.
echo File: src\lib\ocr\models-config.js
echo.
echo For each downloaded model, change:
echo     available: false  --^>  available: true
echo.
echo Models to update:
if exist "%MODEL_DIR%\rec_mobile_v2.onnx" echo   - paddleocr_mobile_v2
if exist "%MODEL_DIR%\rec_server_v2.onnx" echo   - paddleocr_server_v2
if exist "%MODEL_DIR%\rec_v3.onnx" echo   - paddleocr_v3
if exist "%MODEL_DIR%\rec_v4.onnx" echo   - paddleocr_v4
echo.
set /p DUMMY="Press Enter when you've updated the configuration file..."
echo.

echo [Step 5/5] Starting Web Server
echo ----------------------------------------------------------------
echo The web server will start on http://localhost:8000
echo.
echo Features:
echo   - All available models will be automatically benchmarked
echo   - Benchmark results will appear in the model dropdown
echo   - Use "Test All Images" to test all models
echo   - Use "Compare All Models" to see model comparison
echo.
echo Press Ctrl+C to stop the server
echo.
pause

python -m http.server 8000

echo.
echo ================================================================
echo Setup Complete!
echo ================================================================
echo.
echo To restart the server later, run:
echo     python -m http.server 8000
echo.
echo For help, see:
echo     - ADDING_MODELS_GUIDE.md
echo     - scripts\README.md
echo.
pause
