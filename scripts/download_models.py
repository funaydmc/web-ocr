#!/usr/bin/env python3
"""
PaddleOCR Model Download and Conversion Tool

This script downloads PaddleOCR models, converts them to ONNX format,
and prepares them for use in the Web OCR system.

Usage:
    python download_models.py                # Download all models
    python download_models.py v3             # Download specific model
    python download_models.py --list         # List available models

Requirements:
    pip install paddle2onnx requests tqdm
"""

import os
import sys
import tarfile
import argparse
import subprocess
from pathlib import Path
from typing import Dict, List

try:
    import requests
    from tqdm import tqdm
except ImportError:
    print("Error: Required packages not installed")
    print("Install with: pip install requests tqdm")
    sys.exit(1)

# Model URLs and configurations
MODELS = {
    'v2_mobile': {
        'name': 'PP-OCRv2 Mobile',
        'url': 'https://paddleocr.bj.bcebos.com/PP-OCRv2/chinese/ch_PP-OCRv2_rec_infer.tar',
        'output': 'rec_mobile_v2.onnx',
        'size': '8.5 MB',
        'description': 'Lightweight model for mobile/web deployment'
    },
    'v2_server': {
        'name': 'PP-OCRv2 Server',
        'url': 'https://paddleocr.bj.bcebos.com/PP-OCRv2/chinese/ch_PP-OCRv2_rec_server_infer.tar',
        'output': 'rec_server_v2.onnx',
        'size': '94 MB',
        'description': 'High accuracy server model'
    },
    'v3': {
        'name': 'PP-OCRv3',
        'url': 'https://paddleocr.bj.bcebos.com/PP-OCRv3/chinese/ch_PP-OCRv3_rec_infer.tar',
        'output': 'rec_v3.onnx',
        'size': '12 MB',
        'description': 'Latest stable version with improved accuracy'
    },
    'v4': {
        'name': 'PP-OCRv4',
        'url': 'https://paddleocr.bj.bcebos.com/PP-OCRv4/chinese/ch_PP-OCRv4_rec_infer.tar',
        'output': 'rec_v4.onnx',
        'size': '10 MB',
        'description': 'Newest version with best performance'
    }
}

# Directories
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
MODELS_DIR = PROJECT_ROOT / 'static' / 'models'
TEMP_DIR = Path('/tmp/paddleocr_downloads')


def download_file(url: str, output_path: Path) -> bool:
    """Download file with progress bar"""
    try:
        print(f"Downloading from: {url}")
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        total_size = int(response.headers.get('content-length', 0))
        
        with open(output_path, 'wb') as f, tqdm(
            desc=output_path.name,
            total=total_size,
            unit='iB',
            unit_scale=True,
            unit_divisor=1024,
        ) as pbar:
            for chunk in response.iter_content(chunk_size=8192):
                size = f.write(chunk)
                pbar.update(size)
        
        return True
    except requests.exceptions.RequestException as e:
        print(f"Error downloading: {e}")
        return False


def extract_tar(tar_path: Path, extract_dir: Path) -> bool:
    """Extract tar file"""
    try:
        print(f"Extracting {tar_path.name}...")
        with tarfile.open(tar_path, 'r') as tar:
            tar.extractall(extract_dir)
        return True
    except Exception as e:
        print(f"Error extracting: {e}")
        return False


def convert_to_onnx(model_dir: Path, output_path: Path) -> bool:
    """Convert PaddlePaddle model to ONNX"""
    try:
        print(f"Converting to ONNX format...")
        
        # Check if paddle2onnx is installed
        try:
            subprocess.run(['paddle2onnx', '--version'], 
                          capture_output=True, check=True)
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("Error: paddle2onnx not found")
            print("Install with: pip install paddle2onnx")
            return False
        
        # Convert
        cmd = [
            'paddle2onnx',
            '--model_dir', str(model_dir),
            '--model_filename', 'inference.pdmodel',
            '--params_filename', 'inference.pdiparams',
            '--save_file', str(output_path),
            '--opset_version', '11',
            '--enable_onnx_checker', 'True'
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"✓ Converted successfully: {output_path}")
            return True
        else:
            print(f"Error converting: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"Error in conversion: {e}")
        return False


def process_model(model_id: str) -> bool:
    """Download and process a single model"""
    if model_id not in MODELS:
        print(f"Error: Unknown model '{model_id}'")
        return False
    
    model = MODELS[model_id]
    print(f"\n{'='*60}")
    print(f"Processing: {model['name']}")
    print(f"Description: {model['description']}")
    print(f"Size: {model['size']}")
    print(f"{'='*60}\n")
    
    # Create temp directory
    TEMP_DIR.mkdir(parents=True, exist_ok=True)
    
    # Download
    tar_filename = Path(model['url']).name
    tar_path = TEMP_DIR / tar_filename
    
    if not download_file(model['url'], tar_path):
        return False
    
    # Extract
    if not extract_tar(tar_path, TEMP_DIR):
        return False
    
    # Find extracted model directory
    model_dir_name = tar_filename.replace('.tar', '')
    model_dir = TEMP_DIR / model_dir_name
    
    if not model_dir.exists():
        print(f"Error: Extracted directory not found: {model_dir}")
        return False
    
    # Convert to ONNX
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    output_path = MODELS_DIR / model['output']
    
    if not convert_to_onnx(model_dir, output_path):
        return False
    
    print(f"\n✓ {model['name']} ready!")
    print(f"  Location: {output_path}")
    
    return True


def list_models():
    """List all available models"""
    print("\nAvailable PaddleOCR Models:")
    print("="*80)
    print(f"{'ID':<15} {'Name':<25} {'Size':<10} {'Description':<30}")
    print("-"*80)
    for model_id, model in MODELS.items():
        print(f"{model_id:<15} {model['name']:<25} {model['size']:<10} {model['description']}")
    print("="*80)


def update_config():
    """Display instructions for updating config"""
    print("\n" + "="*60)
    print("Next Steps:")
    print("="*60)
    print("\n1. Update src/lib/ocr/models-config.js:")
    print("   Set 'available: true' for the downloaded models\n")
    print("2. Restart your web server:")
    print("   python3 -m http.server 8000\n")
    print("3. Open browser and select models from dropdown\n")
    print("4. Test with 'Test All Images' button\n")
    print("5. Compare with 'Compare All Models' button\n")


def main():
    parser = argparse.ArgumentParser(
        description='Download and convert PaddleOCR models'
    )
    parser.add_argument(
        'models',
        nargs='*',
        help='Model IDs to download (e.g., v3 v4). Leave empty to download all.'
    )
    parser.add_argument(
        '--list',
        action='store_true',
        help='List available models'
    )
    
    args = parser.parse_args()
    
    if args.list:
        list_models()
        return
    
    # Determine which models to process
    if not args.models:
        models_to_process = list(MODELS.keys())
        print(f"No models specified. Downloading all {len(models_to_process)} models.")
    else:
        models_to_process = args.models
    
    # Process each model
    success_count = 0
    failed_models = []
    
    for model_id in models_to_process:
        try:
            if process_model(model_id):
                success_count += 1
            else:
                failed_models.append(model_id)
        except KeyboardInterrupt:
            print("\n\nDownload interrupted by user")
            sys.exit(1)
        except Exception as e:
            print(f"\nUnexpected error processing {model_id}: {e}")
            failed_models.append(model_id)
    
    # Summary
    print("\n" + "="*60)
    print("Download Summary")
    print("="*60)
    print(f"Successfully downloaded: {success_count}/{len(models_to_process)} models")
    
    if failed_models:
        print(f"Failed: {', '.join(failed_models)}")
    
    # Cleanup
    try:
        import shutil
        shutil.rmtree(TEMP_DIR)
        print("\nTemporary files cleaned up")
    except Exception as e:
        print(f"\nWarning: Could not clean up temp directory: {e}")
    
    if success_count > 0:
        update_config()


if __name__ == '__main__':
    main()
