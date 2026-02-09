/**
 * Oscillator Module
 * Web Audio API based tone generation for harmonium and reference sounds
 */

const OscillatorModule = (function () {
    'use strict';

    let audioContext = null;
    let masterGain = null;
    const activeOscillators = new Map();

    // ADSR envelope settings
    const ENVELOPE = {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.7,
        release: 0.3
    };

    /**
     * Initialize the audio context
     */
    function init() {
        if (audioContext) return;

        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            masterGain = audioContext.createGain();
            masterGain.gain.value = 0.5;
            masterGain.connect(audioContext.destination);
        } catch (error) {
            console.error('Failed to create AudioContext:', error);
        }
    }

    /**
     * Resume audio context (needed after user interaction)
     */
    async function resume() {
        if (audioContext && audioContext.state === 'suspended') {
            await audioContext.resume();
        }
    }

    /**
     * Get or create audio context
     * @returns {AudioContext}
     */
    function getContext() {
        if (!audioContext) init();
        return audioContext;
    }

    /**
     * Set master volume
     * @param {number} volume - Volume (0-1)
     */
    function setVolume(volume) {
        if (masterGain) {
            masterGain.gain.setValueAtTime(
                Math.max(0, Math.min(1, volume)),
                audioContext.currentTime
            );
        }
    }

    /**
     * Play a tone at a specific frequency
     * @param {number} frequency - Frequency in Hz
     * @param {string} id - Unique identifier for this tone
     * @param {Object} options - Optional settings
     * @returns {Object} Oscillator control object
     */
    function playTone(frequency, id, options = {}) {
        init();
        resume();

        // Stop any existing tone with this ID
        if (activeOscillators.has(id)) {
            stopTone(id);
        }

        const {
            type = 'sine',
            attack = ENVELOPE.attack,
            decay = ENVELOPE.decay,
            sustain = ENVELOPE.sustain,
            volume = 0.5
        } = options;

        // Create oscillator
        const oscillator = audioContext.createOscillator();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

        // Create gain for envelope
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);

        // Apply attack
        gainNode.gain.linearRampToValueAtTime(
            volume,
            audioContext.currentTime + attack
        );

        // Apply decay to sustain level
        gainNode.gain.linearRampToValueAtTime(
            volume * sustain,
            audioContext.currentTime + attack + decay
        );

        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(masterGain);

        // Start oscillator
        oscillator.start();

        // Store reference
        const oscData = { oscillator, gainNode, frequency };
        activeOscillators.set(id, oscData);

        return {
            stop: () => stopTone(id),
            setFrequency: (freq) => {
                oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                oscData.frequency = freq;
            }
        };
    }

    /**
     * Stop a playing tone
     * @param {string} id - Tone identifier
     */
    function stopTone(id) {
        const oscData = activeOscillators.get(id);
        if (!oscData) return;

        const { oscillator, gainNode } = oscData;
        const now = audioContext.currentTime;

        // Apply release envelope
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.linearRampToValueAtTime(0, now + ENVELOPE.release);

        // Stop and cleanup after release
        setTimeout(() => {
            try {
                oscillator.stop();
                oscillator.disconnect();
                gainNode.disconnect();
            } catch (e) {
                // Already stopped
            }
        }, ENVELOPE.release * 1000 + 50);

        activeOscillators.delete(id);
    }

    /**
     * Stop all active tones
     */
    function stopAll() {
        for (const id of activeOscillators.keys()) {
            stopTone(id);
        }
    }

    /**
     * Play a swara using SwaraModule
     * @param {string} swara - Swara name
     * @param {Object} options - Optional settings
     * @returns {Object} Control object
     */
    function playSwara(swara, options = {}) {
        if (typeof SwaraModule === 'undefined') {
            console.error('SwaraModule not loaded');
            return null;
        }

        const frequency = SwaraModule.getFrequency(swara);
        return playTone(frequency, `swara_${swara}`, options);
    }

    /**
     * Play a meend (glide between notes)
     * @param {string} fromSwara - Starting swara
     * @param {string} toSwara - Ending swara
     * @param {number} duration - Duration in ms
     * @returns {Promise}
     */
    async function playMeend(fromSwara, toSwara, duration = 2000) {
        init();
        await resume();

        const fromFreq = SwaraModule.getFrequency(fromSwara);
        const toFreq = SwaraModule.getFrequency(toSwara);

        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(fromFreq, audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(
            toFreq,
            audioContext.currentTime + duration / 1000
        );

        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration / 1000 + 0.5);

        oscillator.connect(gainNode);
        gainNode.connect(masterGain);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration / 1000 + 0.6);

        return new Promise(resolve => setTimeout(resolve, duration + 600));
    }

    /**
     * Play a sequence of swaras
     * @param {string[]} swaras - Array of swara names
     * @param {number} noteDuration - Duration per note in ms
     * @returns {Promise}
     */
    async function playSequence(swaras, noteDuration = 500) {
        init();
        await resume();

        for (const swara of swaras) {
            const control = playSwara(swara, { volume: 0.4 });
            await new Promise(resolve => setTimeout(resolve, noteDuration));
            if (control) control.stop();
            await new Promise(resolve => setTimeout(resolve, 50)); // Small gap
        }
    }

    /**
     * Play a taal pattern
     * @param {Object} taal - Taal object from TaalModule
     * @param {number} bpm - Beats per minute
     * @param {Function} onBeat - Callback for each beat
     * @returns {Object} Control object
     */
    function playTaal(taal, bpm = 80, onBeat = null) {
        init();
        resume();

        const interval = TaalModule.calculateInterval(bpm);
        let currentBeat = 0;
        let isPlaying = true;

        function playBeat() {
            if (!isPlaying) return;

            const beatNum = currentBeat + 1;
            const beatInfo = TaalModule.getBeatInfo(taal.name.toLowerCase(), beatNum);

            // Different sounds for sam, khali, and regular beats
            let frequency = 200;
            let volume = 0.3;
            let type = 'sine';

            if (beatInfo.isSam) {
                frequency = 400;
                volume = 0.5;
                type = 'triangle';
            } else if (beatInfo.isKhali) {
                frequency = 300;
                volume = 0.2;
            } else if (beatInfo.isTali) {
                frequency = 350;
                volume = 0.4;
            }

            // Play the beat sound
            const osc = audioContext.createOscillator();
            osc.type = type;
            osc.frequency.value = frequency;

            const gain = audioContext.createGain();
            gain.gain.setValueAtTime(volume, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

            osc.connect(gain);
            gain.connect(masterGain);

            osc.start();
            osc.stop(audioContext.currentTime + 0.1);

            // Callback
            if (onBeat) {
                onBeat(beatNum, beatInfo);
            }

            // Next beat
            currentBeat = (currentBeat + 1) % taal.beats;
        }

        const intervalId = setInterval(playBeat, interval);
        playBeat(); // Play first beat immediately

        return {
            stop: () => {
                isPlaying = false;
                clearInterval(intervalId);
            },
            isPlaying: () => isPlaying
        };
    }

    // Public API
    return {
        init,
        resume,
        getContext,
        setVolume,
        playTone,
        stopTone,
        stopAll,
        playSwara,
        playMeend,
        playSequence,
        playTaal
    };
})();

// Make available globally
window.OscillatorModule = OscillatorModule;
