/**
 * Statistics tracking for OCR models
 */

/**
 * Statistics store for each model
 */
const modelStatistics = {};

/**
 * Initialize statistics for a model
 * @param {string} modelId - Model identifier
 */
export function initializeModelStats(modelId) {
    if (!modelStatistics[modelId]) {
        modelStatistics[modelId] = {
            modelId: modelId,
            totalTests: 0,
            totalProcessingTime: 0,
            totalAccuracy: 0,
            perfectMatches: 0,
            tests: []
        };
    }
}

/**
 * Record a test result for a model
 * @param {string} modelId - Model identifier
 * @param {Object} result - Test result containing accuracy and processing time
 */
export function recordTestResult(modelId, result) {
    initializeModelStats(modelId);
    
    const stats = modelStatistics[modelId];
    stats.totalTests++;
    stats.totalProcessingTime += parseFloat(result.processingTime);
    stats.totalAccuracy += parseFloat(result.accuracy.accuracy);
    
    if (result.accuracy.identical) {
        stats.perfectMatches++;
    }
    
    stats.tests.push({
        fileName: result.fileName,
        accuracy: result.accuracy.accuracy,
        processingTime: result.processingTime,
        timestamp: new Date().toISOString()
    });
}

/**
 * Get statistics for a specific model
 * @param {string} modelId - Model identifier
 * @returns {Object} Model statistics
 */
export function getModelStatistics(modelId) {
    const stats = modelStatistics[modelId];
    
    if (!stats || stats.totalTests === 0) {
        return {
            modelId: modelId,
            totalTests: 0,
            avgProcessingTime: 0,
            avgAccuracy: 0,
            perfectMatches: 0,
            tests: []
        };
    }
    
    return {
        modelId: stats.modelId,
        totalTests: stats.totalTests,
        avgProcessingTime: (stats.totalProcessingTime / stats.totalTests).toFixed(2),
        avgAccuracy: (stats.totalAccuracy / stats.totalTests).toFixed(2),
        perfectMatches: stats.perfectMatches,
        perfectMatchRate: ((stats.perfectMatches / stats.totalTests) * 100).toFixed(2),
        tests: stats.tests
    };
}

/**
 * Get statistics for all models
 * @returns {Object} Statistics for all models
 */
export function getAllModelStatistics() {
    const allStats = {};
    
    for (const modelId in modelStatistics) {
        allStats[modelId] = getModelStatistics(modelId);
    }
    
    return allStats;
}

/**
 * Clear statistics for a specific model
 * @param {string} modelId - Model identifier
 */
export function clearModelStatistics(modelId) {
    delete modelStatistics[modelId];
}

/**
 * Clear all statistics
 */
export function clearAllStatistics() {
    for (const modelId in modelStatistics) {
        delete modelStatistics[modelId];
    }
}

/**
 * Export statistics to JSON
 * @returns {string} JSON string of all statistics
 */
export function exportStatistics() {
    return JSON.stringify(getAllModelStatistics(), null, 2);
}

/**
 * Compare multiple models
 * @param {string[]} modelIds - Array of model IDs to compare
 * @returns {Array} Comparison results sorted by accuracy
 */
export function compareModels(modelIds) {
    const comparison = modelIds.map(modelId => {
        const stats = getModelStatistics(modelId);
        return {
            modelId: modelId,
            avgAccuracy: parseFloat(stats.avgAccuracy),
            avgProcessingTime: parseFloat(stats.avgProcessingTime),
            totalTests: stats.totalTests,
            perfectMatches: stats.perfectMatches,
            perfectMatchRate: parseFloat(stats.perfectMatchRate)
        };
    });
    
    // Sort by average accuracy (descending)
    comparison.sort((a, b) => b.avgAccuracy - a.avgAccuracy);
    
    return comparison;
}
