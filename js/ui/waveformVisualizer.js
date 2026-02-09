/**
 * Waveform Visualizer
 * Canvas-based real-time audio waveform visualization
 */

const WaveformVisualizer = (function () {
    'use strict';

    let canvas = null;
    let ctx = null;
    let animationId = null;
    let isRunning = false;

    // Configuration
    const CONFIG = {
        bgColor: '#1a1a1a',
        lineWidth: 2,
        defaultColor: '#666666',
        correctColor: '#4caf50',
        highColor: '#f44336',
        lowColor: '#2196f3'
    };

    let currentColor = CONFIG.defaultColor;
    let waveformData = null;

    /**
     * Initialize the visualizer with a canvas element
     * @param {HTMLCanvasElement} canvasElement 
     */
    function init(canvasElement) {
        canvas = canvasElement;
        ctx = canvas.getContext('2d');

        // Set canvas size
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }

    /**
     * Resize canvas to match display size
     */
    function resizeCanvas() {
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    /**
     * Set the color based on pitch accuracy
     * @param {string} status - 'correct', 'high', 'low', or 'default'
     */
    function setAccuracyColor(status) {
        switch (status) {
            case 'correct':
                currentColor = CONFIG.correctColor;
                break;
            case 'high':
                currentColor = CONFIG.highColor;
                break;
            case 'low':
                currentColor = CONFIG.lowColor;
                break;
            default:
                currentColor = CONFIG.defaultColor;
        }
    }

    /**
     * Update waveform data
     * @param {Float32Array} data - Audio waveform data
     */
    function updateData(data) {
        waveformData = data;
    }

    /**
     * Draw the waveform
     */
    function draw() {
        if (!ctx || !canvas) return;

        const width = canvas.width / window.devicePixelRatio;
        const height = canvas.height / window.devicePixelRatio;

        // Clear canvas
        ctx.fillStyle = CONFIG.bgColor;
        ctx.fillRect(0, 0, width, height);

        // Draw center line
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        if (!waveformData || waveformData.length === 0) {
            // Draw idle state
            drawIdleWave(width, height);
            return;
        }

        // Draw waveform
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = CONFIG.lineWidth;
        ctx.beginPath();

        const sliceWidth = width / waveformData.length;
        let x = 0;

        for (let i = 0; i < waveformData.length; i++) {
            const v = waveformData[i];
            const y = (v + 1) / 2 * height;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        ctx.stroke();

        // Add glow effect
        ctx.shadowColor = currentColor;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    /**
     * Draw idle animation when not listening
     * @param {number} width 
     * @param {number} height 
     */
    function drawIdleWave(width, height) {
        const time = Date.now() / 1000;

        ctx.strokeStyle = CONFIG.defaultColor;
        ctx.lineWidth = 1;
        ctx.beginPath();

        for (let x = 0; x < width; x++) {
            const y = height / 2 + Math.sin(x * 0.02 + time) * 10 * Math.sin(time * 0.5);

            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.stroke();
    }

    /**
     * Start the visualization loop
     */
    function start() {
        if (isRunning) return;
        isRunning = true;
        animate();
    }

    /**
     * Animation loop
     */
    function animate() {
        if (!isRunning) return;
        draw();
        animationId = requestAnimationFrame(animate);
    }

    /**
     * Stop the visualization
     */
    function stop() {
        isRunning = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        waveformData = null;
        currentColor = CONFIG.defaultColor;
        draw();
    }

    /**
     * Check if running
     * @returns {boolean}
     */
    function isActive() {
        return isRunning;
    }

    /**
     * Clean up
     */
    function cleanup() {
        stop();
        window.removeEventListener('resize', resizeCanvas);
        canvas = null;
        ctx = null;
    }

    // Public API
    return {
        init,
        setAccuracyColor,
        updateData,
        draw,
        start,
        stop,
        isActive,
        cleanup
    };
})();

// Make available globally
window.WaveformVisualizer = WaveformVisualizer;
