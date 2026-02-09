/**
 * Security Utilities
 * Input sanitization and security measures
 */

const Security = (function () {
    'use strict';

    /**
     * Sanitize HTML string to prevent XSS
     * @param {string} str - Input string
     * @returns {string} Sanitized string
     */
    function sanitizeHTML(str) {
        if (typeof str !== 'string') return '';

        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Sanitize attribute value
     * @param {string} str - Input string
     * @returns {string} Sanitized string
     */
    function sanitizeAttribute(str) {
        if (typeof str !== 'string') return '';

        return str
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    /**
     * Validate that a value is a number within range
     * @param {*} value - Value to validate
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @param {number} defaultValue - Default if invalid
     * @returns {number}
     */
    function validateNumber(value, min, max, defaultValue) {
        const num = parseFloat(value);
        if (isNaN(num) || num < min || num > max) {
            return defaultValue;
        }
        return num;
    }

    /**
     * Validate a string is alphanumeric
     * @param {string} str - Input string
     * @returns {boolean}
     */
    function isAlphanumeric(str) {
        return /^[a-zA-Z0-9_]+$/.test(str);
    }

    /**
     * Safe JSON parse
     * @param {string} jsonString - JSON string
     * @param {*} defaultValue - Default value if parse fails
     * @returns {*}
     */
    function safeJSONParse(jsonString, defaultValue = null) {
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            return defaultValue;
        }
    }

    /**
     * Check if origin is allowed
     * @param {string} origin - Origin to check
     * @returns {boolean}
     */
    function isAllowedOrigin(origin) {
        // In a static GitHub Pages app, we only allow same-origin
        return origin === window.location.origin;
    }

    /**
     * Create a CSP nonce (for inline scripts if needed)
     * @returns {string}
     */
    function generateNonce() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return btoa(String.fromCharCode.apply(null, array));
    }

    /**
     * Validate and sanitize URL
     * @param {string} url - URL to validate
     * @returns {string|null} Sanitized URL or null if invalid
     */
    function sanitizeURL(url) {
        try {
            const parsed = new URL(url, window.location.origin);

            // Only allow http/https protocols
            if (!['http:', 'https:'].includes(parsed.protocol)) {
                return null;
            }

            return parsed.href;
        } catch (e) {
            return null;
        }
    }

    /**
     * Log security-related events (for debugging)
     * @param {string} event - Event type
     * @param {Object} details - Event details
     */
    function logSecurityEvent(event, details = {}) {
        if (typeof console !== 'undefined' && console.warn) {
            console.warn(`[Security] ${event}`, details);
        }
    }

    // Public API
    return {
        sanitizeHTML,
        sanitizeAttribute,
        validateNumber,
        isAlphanumeric,
        safeJSONParse,
        isAllowedOrigin,
        generateNonce,
        sanitizeURL,
        logSecurityEvent
    };
})();

// Make available globally
window.Security = Security;
