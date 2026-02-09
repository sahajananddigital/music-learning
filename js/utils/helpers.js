/**
 * Helper Utilities
 */

const Helpers = (function () {
    'use strict';

    /**
     * Debounce function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function}
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in ms
     * @returns {Function}
     */
    function throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Format frequency with units
     * @param {number} freq - Frequency in Hz
     * @returns {string}
     */
    function formatFrequency(freq) {
        if (freq === null || freq === undefined || freq < 0) {
            return '-- Hz';
        }
        return `${freq.toFixed(1)} Hz`;
    }

    /**
     * Convert cents to percentage (for pitch accuracy)
     * @param {number} cents - Cents deviation
     * @returns {number}
     */
    function centsToPercentage(cents) {
        // 50 cents = 0%, 0 cents = 100%
        return Math.max(0, Math.min(100, 100 - Math.abs(cents) * 2));
    }

    /**
     * Linear interpolation
     * @param {number} a - Start value
     * @param {number} b - End value
     * @param {number} t - Interpolation factor (0-1)
     * @returns {number}
     */
    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    /**
     * Clamp value between min and max
     * @param {number} value 
     * @param {number} min 
     * @param {number} max 
     * @returns {number}
     */
    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * Map value from one range to another
     * @param {number} value 
     * @param {number} inMin 
     * @param {number} inMax 
     * @param {number} outMin 
     * @param {number} outMax 
     * @returns {number}
     */
    function mapRange(value, inMin, inMax, outMin, outMax) {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }

    /**
     * Get color for pitch accuracy
     * @param {string} status - 'correct', 'high', or 'low'
     * @returns {string} CSS color
     */
    function getAccuracyColor(status) {
        switch (status) {
            case 'correct': return '#4caf50';
            case 'high': return '#f44336';
            case 'low': return '#2196f3';
            default: return '#666666';
        }
    }

    /**
     * Generate unique ID
     * @returns {string}
     */
    function generateId() {
        return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Check if browser supports required APIs
     * @returns {Object}
     */
    function checkBrowserSupport() {
        return {
            audioContext: !!(window.AudioContext || window.webkitAudioContext),
            getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
            mediaRecorder: 'MediaRecorder' in window,
            canvas: !!document.createElement('canvas').getContext,
            allSupported: function () {
                return this.audioContext && this.getUserMedia && this.mediaRecorder && this.canvas;
            }
        };
    }

    /**
     * Show a toast notification
     * @param {string} message 
     * @param {string} type - 'success', 'error', 'info'
     * @param {number} duration - Duration in ms
     */
    function showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            border-radius: 8px;
            color: white;
            font-family: var(--font-family, sans-serif);
            z-index: 10000;
            animation: slideUp 0.3s ease;
            background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4caf50' : '#2196f3'};
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }

    /**
     * Wait for a specified time
     * @param {number} ms - Milliseconds
     * @returns {Promise}
     */
    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Public API
    return {
        debounce,
        throttle,
        formatFrequency,
        centsToPercentage,
        lerp,
        clamp,
        mapRange,
        getAccuracyColor,
        generateId,
        checkBrowserSupport,
        showToast,
        wait
    };
})();

// Make available globally
window.Helpers = Helpers;
