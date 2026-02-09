/**
 * Audio Recorder Module
 * Record, playback, and download audio recordings
 */

const AudioRecorder = (function () {
    'use strict';

    let mediaRecorder = null;
    let audioChunks = [];
    let recordedBlob = null;
    let mediaStream = null;
    let isRecording = false;
    let recordingStartTime = 0;
    let onDataCallback = null;

    /**
     * Request microphone access if not already granted
     * @returns {Promise<MediaStream>}
     */
    async function getMicrophoneStream() {
        if (mediaStream) return mediaStream;

        mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                sampleRate: 44100
            }
        });

        return mediaStream;
    }

    /**
     * Start recording
     * @param {Function} onTimeUpdate - Called with time updates
     * @returns {Promise<boolean>}
     */
    async function startRecording(onTimeUpdate = null) {
        try {
            const stream = await getMicrophoneStream();

            audioChunks = [];
            recordedBlob = null;

            // Determine best mime type
            const mimeType = MediaRecorder.isTypeSupported('audio/webm')
                ? 'audio/webm'
                : 'audio/mp4';

            mediaRecorder = new MediaRecorder(stream, { mimeType });

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                recordedBlob = new Blob(audioChunks, { type: mimeType });
                if (onDataCallback) {
                    onDataCallback(recordedBlob);
                }
            };

            mediaRecorder.start(100); // Collect data every 100ms
            isRecording = true;
            recordingStartTime = Date.now();

            // Time update interval
            if (onTimeUpdate) {
                const timeInterval = setInterval(() => {
                    if (!isRecording) {
                        clearInterval(timeInterval);
                        return;
                    }
                    const elapsed = Date.now() - recordingStartTime;
                    onTimeUpdate(elapsed);
                }, 100);
            }

            return true;
        } catch (error) {
            console.error('Failed to start recording:', error);
            return false;
        }
    }

    /**
     * Stop recording
     * @returns {Promise<Blob>}
     */
    function stopRecording() {
        return new Promise((resolve) => {
            if (!mediaRecorder || !isRecording) {
                resolve(null);
                return;
            }

            onDataCallback = (blob) => {
                resolve(blob);
            };

            isRecording = false;
            mediaRecorder.stop();
        });
    }

    /**
     * Get the recorded blob
     * @returns {Blob|null}
     */
    function getRecordedBlob() {
        return recordedBlob;
    }

    /**
     * Get recording as object URL for playback
     * @returns {string|null}
     */
    function getPlaybackUrl() {
        if (!recordedBlob) return null;
        return URL.createObjectURL(recordedBlob);
    }

    /**
     * Convert blob to WAV format for download
     * @param {Blob} blob - Audio blob
     * @returns {Promise<Blob>}
     */
    async function convertToWav(blob) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // WAV encoding
        const numChannels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const length = audioBuffer.length;
        const bytesPerSample = 2; // 16-bit
        const blockAlign = numChannels * bytesPerSample;
        const byteRate = sampleRate * blockAlign;
        const dataSize = length * blockAlign;

        const buffer = new ArrayBuffer(44 + dataSize);
        const view = new DataView(buffer);

        // WAV header
        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + dataSize, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, byteRate, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bytesPerSample * 8, true);
        writeString(view, 36, 'data');
        view.setUint32(40, dataSize, true);

        // Audio data
        const channelData = [];
        for (let i = 0; i < numChannels; i++) {
            channelData.push(audioBuffer.getChannelData(i));
        }

        let offset = 44;
        for (let i = 0; i < length; i++) {
            for (let channel = 0; channel < numChannels; channel++) {
                const sample = Math.max(-1, Math.min(1, channelData[channel][i]));
                const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
                view.setInt16(offset, intSample, true);
                offset += 2;
            }
        }

        await audioContext.close();
        return new Blob([buffer], { type: 'audio/wav' });
    }

    /**
     * Helper to write string to DataView
     */
    function writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    /**
     * Download recording as WAV file
     * @param {string} filename - Filename without extension
     * @returns {Promise<boolean>}
     */
    async function downloadAsWav(filename = 'recording') {
        if (!recordedBlob) {
            console.error('No recording available');
            return false;
        }

        try {
            const wavBlob = await convertToWav(recordedBlob);
            const url = URL.createObjectURL(wavBlob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}.wav`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            console.error('Failed to download recording:', error);
            return false;
        }
    }

    /**
     * Check if currently recording
     * @returns {boolean}
     */
    function isActive() {
        return isRecording;
    }

    /**
     * Get recording duration in milliseconds
     * @returns {number}
     */
    function getDuration() {
        if (!isRecording) return 0;
        return Date.now() - recordingStartTime;
    }

    /**
     * Format time in mm:ss format
     * @param {number} ms - Milliseconds
     * @returns {string}
     */
    function formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Clean up resources
     */
    function cleanup() {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
        }

        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            mediaStream = null;
        }

        isRecording = false;
        mediaRecorder = null;
        audioChunks = [];
        recordedBlob = null;
    }

    // Public API
    return {
        startRecording,
        stopRecording,
        getRecordedBlob,
        getPlaybackUrl,
        downloadAsWav,
        isActive,
        getDuration,
        formatTime,
        cleanup
    };
})();

// Make available globally
window.AudioRecorder = AudioRecorder;
