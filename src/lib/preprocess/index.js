/**
 * Image preprocessing utilities for OCR
 * Handles resizing, normalization, and format conversion for ONNX models
 */

/**
 * Preprocess image for recognition model
 * Target size: 320x48 pixels (width x height)
 * @param {HTMLImageElement} image - Input image
 * @returns {Float32Array} Preprocessed tensor in NCHW format [1, 3, 48, 320]
 */
export function preprocessForRecognition(image) {
    const targetWidth = 320;
    const targetHeight = 48;

    // Create canvas for resizing
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    // Enable high quality image smoothing for better interpolation
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Resize image (aspect ratio not preserved as per model training)
    ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

    // Get image data
    const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    const pixels = imageData.data;

    // Prepare tensor: [1, 3, 48, 320]
    const tensorSize = 1 * 3 * targetHeight * targetWidth;
    const tensor = new Float32Array(tensorSize);

    // Convert from RGBA to RGB and normalize to [0, 1]
    // Also transpose from HWC to CHW format
    for (let h = 0; h < targetHeight; h++) {
        for (let w = 0; w < targetWidth; w++) {
            const pixelIndex = (h * targetWidth + w) * 4;
            const tensorIndex = h * targetWidth + w;

            // R channel
            tensor[tensorIndex] = pixels[pixelIndex] / 255.0;
            // G channel
            tensor[targetHeight * targetWidth + tensorIndex] = pixels[pixelIndex + 1] / 255.0;
            // B channel
            tensor[2 * targetHeight * targetWidth + tensorIndex] = pixels[pixelIndex + 2] / 255.0;
        }
    }

    return tensor;
}

/**
 * Preprocess image for detection model
 * Target size: 640x640 pixels
 * @param {HTMLImageElement} image - Input image
 * @returns {Float32Array} Preprocessed tensor in NCHW format [1, 3, 640, 640]
 */
export function preprocessForDetection(image) {
    const targetSize = 640;

    // Create canvas for resizing
    const canvas = document.createElement('canvas');
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext('2d');

    // Resize image
    ctx.drawImage(image, 0, 0, targetSize, targetSize);

    // Get image data
    const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
    const pixels = imageData.data;

    // Prepare tensor: [1, 3, 640, 640]
    const tensorSize = 1 * 3 * targetSize * targetSize;
    const tensor = new Float32Array(tensorSize);

    // Convert from RGBA to RGB and normalize to [0, 1]
    // Also transpose from HWC to CHW format
    for (let h = 0; h < targetSize; h++) {
        for (let w = 0; w < targetSize; w++) {
            const pixelIndex = (h * targetSize + w) * 4;
            const tensorIndex = h * targetSize + w;

            // R channel
            tensor[tensorIndex] = pixels[pixelIndex] / 255.0;
            // G channel
            tensor[targetSize * targetSize + tensorIndex] = pixels[pixelIndex + 1] / 255.0;
            // B channel
            tensor[2 * targetSize * targetSize + tensorIndex] = pixels[pixelIndex + 2] / 255.0;
        }
    }

    return tensor;
}

/**
 * Draw image on canvas for display
 * @param {HTMLImageElement} image - Input image
 * @param {HTMLCanvasElement} canvas - Target canvas
 */
export function drawImageOnCanvas(image, canvas) {
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match image
    canvas.width = image.width;
    canvas.height = image.height;
    
    // Draw image
    ctx.drawImage(image, 0, 0);
}
