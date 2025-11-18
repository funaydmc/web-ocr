/**
 * Main application logic for Web OCR system
 */

import { preprocessForRecognition, drawImageOnCanvas } from '../lib/preprocess/index.js';
import { loadCharacterDictionary, loadModels, recognizeText, calculateAccuracy } from '../lib/ocr/index.js';

// Global state
let ocrModel = null;
let dictionary = null;
let groundTruthData = null;
let currentImageName = null;

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Initialize the application
 */
async function init() {
    showLoading('Initializing OCR system...');
    
    try {
        // Load character dictionary
        console.log('Loading character dictionary...');
        dictionary = await loadCharacterDictionary();
        console.log(`Dictionary loaded: ${dictionary.length} characters`);
        
        // Load ONNX models
        console.log('Loading ONNX models...');
        const models = await loadModels();
        ocrModel = models.recModel;
        console.log('Models loaded successfully');
        
        // Load ground truth data
        console.log('Loading ground truth data...');
        const response = await fetch('static/tests/ground_truth.json');
        groundTruthData = await response.json();
        console.log('Ground truth data loaded');
        
        // Set up event listeners
        setupEventListeners();
        
        hideLoading();
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Initialization error:', error);
        hideLoading();
        alert('Failed to initialize OCR system: ' + error.message);
    }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // File input change
    const imageInput = document.getElementById('imageInput');
    imageInput.addEventListener('change', handleImageUpload);
    
    // Test all button
    const testAllBtn = document.getElementById('testAllBtn');
    testAllBtn.addEventListener('click', handleTestAll);
}

/**
 * Handle image upload
 */
async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Update file name display
    document.getElementById('fileName').textContent = file.name;
    currentImageName = file.name;
    
    // Load and process image
    const image = await loadImage(file);
    await processImage(image, file.name);
}

/**
 * Load image from file
 */
function loadImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Process image through OCR pipeline
 */
async function processImage(image, imageName) {
    try {
        // Display image
        const canvas = document.getElementById('imageCanvas');
        drawImageOnCanvas(image, canvas);
        document.getElementById('imageInfo').textContent = 
            `Size: ${image.width}x${image.height} pixels`;
        
        // Start timing
        const startTime = performance.now();
        
        // Preprocess image
        console.log('Preprocessing image...');
        const inputTensor = preprocessForRecognition(image);
        
        // Perform OCR
        console.log('Performing OCR...');
        const ocrText = await recognizeText(ocrModel, inputTensor, dictionary);
        
        // End timing
        const endTime = performance.now();
        const processingTime = (endTime - startTime).toFixed(2);
        
        console.log(`OCR Result: "${ocrText}"`);
        console.log(`Processing time: ${processingTime}ms`);
        
        // Display results
        displayOCRResult(ocrText, processingTime);
        
        // Find and display ground truth
        const groundTruth = findGroundTruth(imageName);
        displayGroundTruth(groundTruth);
        
        // Calculate and display accuracy
        if (groundTruth) {
            const accuracy = calculateAccuracy(ocrText, groundTruth);
            displayAccuracy(accuracy);
        }
        
    } catch (error) {
        console.error('Error processing image:', error);
        alert('Error processing image: ' + error.message);
    }
}

/**
 * Display OCR result
 */
function displayOCRResult(text, processingTime) {
    const resultDiv = document.getElementById('ocrResult');
    resultDiv.textContent = text || 'No text detected';
    
    const timeDiv = document.getElementById('processingTime');
    timeDiv.textContent = `⏱️ Processing Time: ${processingTime}ms`;
}

/**
 * Display ground truth
 */
function displayGroundTruth(groundTruth) {
    const gtDiv = document.getElementById('groundTruth');
    if (groundTruth) {
        gtDiv.textContent = groundTruth;
    } else {
        gtDiv.textContent = 'No ground truth available';
    }
}

/**
 * Display accuracy metrics
 */
function displayAccuracy(accuracy) {
    const accuracyDiv = document.getElementById('accuracy');
    
    if (accuracy.total === 0) {
        accuracyDiv.innerHTML = `<p class="placeholder">No ground truth to compare</p>`;
        return;
    }
    
    const accuracyValue = parseFloat(accuracy.accuracy);
    let colorClass = 'accuracy-high';
    if (accuracyValue < 50) colorClass = 'accuracy-low';
    else if (accuracyValue < 80) colorClass = 'accuracy-medium';
    
    accuracyDiv.innerHTML = `
        <div class="accuracy-value ${colorClass}">${accuracy.accuracy}%</div>
        <div class="accuracy-label">Character Accuracy</div>
        <div class="comparison-details">
            ${accuracy.correct} / ${accuracy.total} characters correct
            ${accuracy.identical ? '<br>✓ Exact match!' : ''}
        </div>
    `;
}

/**
 * Find ground truth for given image name
 */
function findGroundTruth(imageName) {
    if (!groundTruthData) return null;
    
    const entry = groundTruthData.find(item => item.file_name === imageName);
    return entry ? entry.ground_truth_text : null;
}

/**
 * Handle test all images button
 */
async function handleTestAll() {
    if (!groundTruthData || groundTruthData.length === 0) {
        alert('No test data available');
        return;
    }
    
    showLoading('Testing all images...');
    
    const results = [];
    
    try {
        for (let i = 0; i < groundTruthData.length; i++) {
            const testData = groundTruthData[i];
            const imagePath = `static/tests/${testData.file_name}`;
            
            console.log(`Processing ${testData.file_name}...`);
            
            // Load image
            const img = await loadImageFromURL(imagePath);
            
            // Start timing
            const startTime = performance.now();
            
            // Preprocess and recognize
            const inputTensor = preprocessForRecognition(img);
            const ocrText = await recognizeText(ocrModel, inputTensor, dictionary);
            
            // End timing
            const endTime = performance.now();
            const processingTime = (endTime - startTime).toFixed(2);
            
            // Calculate accuracy
            const accuracy = calculateAccuracy(ocrText, testData.ground_truth_text);
            
            results.push({
                fileName: testData.file_name,
                ocrText: ocrText,
                groundTruth: testData.ground_truth_text,
                accuracy: accuracy,
                processingTime: processingTime
            });
            
            console.log(`${testData.file_name}: ${accuracy.accuracy}% (${processingTime}ms)`);
        }
        
        // Display results
        displayTestResults(results);
        
        hideLoading();
        
        // Scroll to results
        document.getElementById('testResultsSection').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error during batch testing:', error);
        hideLoading();
        alert('Error during batch testing: ' + error.message);
    }
}

/**
 * Load image from URL
 */
function loadImageFromURL(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
}

/**
 * Display batch test results
 */
function displayTestResults(results) {
    const testResultsSection = document.getElementById('testResultsSection');
    const testResultsDiv = document.getElementById('testResults');
    const overallStatsDiv = document.getElementById('overallStats');
    
    // Show section
    testResultsSection.style.display = 'block';
    
    // Generate result cards
    let html = '';
    for (const result of results) {
        const accuracyValue = parseFloat(result.accuracy.accuracy);
        let statusClass = 'success';
        if (accuracyValue < 50) statusClass = 'fail';
        else if (accuracyValue < 90) statusClass = 'partial';
        
        html += `
            <div class="test-result-item ${statusClass}">
                <h4>${escapeHtml(result.fileName)}</h4>
                <div class="test-accuracy">${result.accuracy.accuracy}%</div>
                <div class="test-time">⏱️ ${result.processingTime}ms</div>
                <div class="test-text">
                    <strong>OCR:</strong> ${escapeHtml(result.ocrText)}<br>
                    <strong>Truth:</strong> ${escapeHtml(result.groundTruth)}
                </div>
            </div>
        `;
    }
    testResultsDiv.innerHTML = html;
    
    // Calculate overall statistics
    const avgAccuracy = results.reduce((sum, r) => sum + parseFloat(r.accuracy.accuracy), 0) / results.length;
    const avgTime = results.reduce((sum, r) => sum + parseFloat(r.processingTime), 0) / results.length;
    const totalCorrect = results.reduce((sum, r) => sum + r.accuracy.correct, 0);
    const totalChars = results.reduce((sum, r) => sum + r.accuracy.total, 0);
    const perfectMatches = results.filter(r => r.accuracy.identical).length;
    
    overallStatsDiv.innerHTML = `
        <h3>📊 Overall Statistics</h3>
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-value">${avgAccuracy.toFixed(2)}%</div>
                <div class="stat-label">Average Accuracy</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${avgTime.toFixed(2)}ms</div>
                <div class="stat-label">Average Time</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${totalCorrect}/${totalChars}</div>
                <div class="stat-label">Total Characters</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${perfectMatches}/${results.length}</div>
                <div class="stat-label">Perfect Matches</div>
            </div>
        </div>
    `;
}

/**
 * Show loading overlay
 */
function showLoading(message) {
    const loadingSection = document.getElementById('loadingSection');
    const loadingText = document.getElementById('loadingText');
    loadingText.textContent = message;
    loadingSection.style.display = 'block';
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    const loadingSection = document.getElementById('loadingSection');
    loadingSection.style.display = 'none';
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
