/**
 * Pitch Detector Module
 * Real-time pitch detection using autocorrelation algorithm
 */

const PitchDetector = (function () {
    'use strict';

    let audioContext = null;
    let analyser = null;
    let mediaStream = null;
    let sourceNode = null;
    let dataArray = null;
    let isListening = false;
    let animationFrameId = null;
    let onPitchCallback = null;

    // Configuration
    const CONFIG = {
        fftSize: 2048,
        minFrequency: 60,
        maxFrequency: 1000,
        minCorrelation: 0.9,
        smoothingFactor: 0.8
    };

    // Smoothing for pitch values
    let lastPitch = 0;

    /**
     * Request microphone permission and setup audio
     * @returns {Promise<boolean>}
     */
    async function requestMicrophoneAccess() {
        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = CONFIG.fftSize;

            sourceNode = audioContext.createMediaStreamSource(mediaStream);
            sourceNode.connect(analyser);

            dataArray = new Float32Array(analyser.fftSize);

            return true;
        } catch (error) {
            console.error('Microphone access denied:', error);
            return false;
        }
    }

    /**
     * Check if microphone permission is granted
     * @returns {Promise<string>} 'granted', 'denied', or 'prompt'
     */
    async function checkPermission() {
        try {
            const result = await navigator.permissions.query({ name: 'microphone' });
            return result.state;
        } catch (error) {
            return 'prompt';
        }
    }

    /**
     * Autocorrelation pitch detection
     * @param {Float32Array} buffer - Audio data buffer
     * @returns {number} Detected frequency or -1 if none
     */
    function detectPitch(buffer) {
        const sampleRate = audioContext.sampleRate;
        const SIZE = buffer.length;

        // Calculate RMS to check if there's audio
        let rms = 0;
        for (let i = 0; i < SIZE; i++) {
            rms += buffer[i] * buffer[i];
        }
        rms = Math.sqrt(rms / SIZE);

        // Silence threshold
        if (rms < 0.01) {
            return -1;
        }

        // Autocorrelation
        let correlation = new Float32Array(SIZE);
        let maxCorrelation = 0;
        let bestOffset = -1;

        // Check correlations for frequencies in range
        const minPeriod = Math.floor(sampleRate / CONFIG.maxFrequency);
        const maxPeriod = Math.floor(sampleRate / CONFIG.minFrequency);

        for (let offset = minPeriod; offset < Math.min(maxPeriod, SIZE); offset++) {
            let sum = 0;
            for (let i = 0; i < SIZE - offset; i++) {
                sum += buffer[i] * buffer[i + offset];
            }
            correlation[offset] = sum;

            if (sum > maxCorrelation) {
                maxCorrelation = sum;
                bestOffset = offset;
            }
        }

        // Normalize and check correlation quality
        if (bestOffset !== -1) {
            // Calculate normalized correlation at best offset
            let sumSq1 = 0, sumSq2 = 0;
            for (let i = 0; i < SIZE - bestOffset; i++) {
                sumSq1 += buffer[i] * buffer[i];
                sumSq2 += buffer[i + bestOffset] * buffer[i + bestOffset];
            }
            const normalizedCorr = maxCorrelation / Math.sqrt(sumSq1 * sumSq2);

            if (normalizedCorr > CONFIG.minCorrelation) {
                // Parabolic interpolation for more accurate peak
                const y1 = correlation[bestOffset - 1] || 0;
                const y2 = correlation[bestOffset];
                const y3 = correlation[bestOffset + 1] || 0;

                const a = (y1 - 2 * y2 + y3) / 2;
                const b = (y3 - y1) / 2;

                if (a !== 0) {
                    const betterOffset = bestOffset - b / (2 * a);
                    const frequency = sampleRate / betterOffset;
                    return frequency;
                }

                return sampleRate / bestOffset;
            }
        }

        return -1;
    }

    /**
     * Main analysis loop
     */
    function analyze() {
        if (!isListening) return;

        analyser.getFloatTimeDomainData(dataArray);
        let pitch = detectPitch(dataArray);

        // Apply smoothing
        if (pitch > 0 && lastPitch > 0) {
            pitch = lastPitch * CONFIG.smoothingFactor + pitch * (1 - CONFIG.smoothingFactor);
        }

        if (pitch > 0) {
            lastPitch = pitch;
        }

        // Callback with pitch data
        if (onPitchCallback) {
            const swaraInfo = pitch > 0 ? SwaraModule.detectSwara(pitch) : null;
            onPitchCallback({
                frequency: pitch > 0 ? pitch : null,
                swara: swaraInfo,
                rms: calculateRMS(dataArray),
                waveformData: new Float32Array(dataArray)
            });
        }

        animationFrameId = requestAnimationFrame(analyze);
    }

    /**
     * Calculate RMS (loudness) of audio buffer
     * @param {Float32Array} buffer 
     * @returns {number}
     */
    function calculateRMS(buffer) {
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
            sum += buffer[i] * buffer[i];
        }
        return Math.sqrt(sum / buffer.length);
    }

    /**
     * Start listening for pitch
     * @param {Function} callback - Called with pitch data
     * @returns {Promise<boolean>}
     */
    async function startListening(callback) {
        if (isListening) return true;

        if (!mediaStream) {
            const success = await requestMicrophoneAccess();
            if (!success) return false;
        }

        // Resume context if suspended
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        onPitchCallback = callback;
        isListening = true;
        lastPitch = 0;
        analyze();

        return true;
    }

    /**
     * Stop listening
     */
    function stopListening() {
        isListening = false;
        onPitchCallback = null;

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    /**
     * Clean up resources
     */
    function cleanup() {
        stopListening();

        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            mediaStream = null;
        }

        if (sourceNode) {
            sourceNode.disconnect();
            sourceNode = null;
        }

        if (audioContext) {
            audioContext.close();
            audioContext = null;
        }
    }

    /**
     * Get current audio context
     * @returns {AudioContext|null}
     */
    function getAudioContext() {
        return audioContext;
    }

    /**
     * Get analyser node for visualization
     * @returns {AnalyserNode|null}
     */
    function getAnalyser() {
        return analyser;
    }

    /**
     * Check if currently listening
     * @returns {boolean}
     */
    function isActive() {
        return isListening;
    }

    // Public API
    return {
        requestMicrophoneAccess,
        checkPermission,
        startListening,
        stopListening,
        cleanup,
        getAudioContext,
        getAnalyser,
        isActive
    };
})();

// Make available globally
window.PitchDetector = PitchDetector;
