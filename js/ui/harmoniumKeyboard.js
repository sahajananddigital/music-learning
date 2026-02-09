/**
 * Harmonium Keyboard UI
 * Interactive harmonium keyboard with mouse and keyboard support
 */

const HarmoniumKeyboard = (function () {
    'use strict';

    let container = null;
    let noteDisplayName = null;
    let noteDisplayFreq = null;
    let activeKeys = new Set();
    let onNotePlay = null;
    let onNoteStop = null;

    // Key definitions for one octave
    const OCTAVE_KEYS = [
        { note: 'Sa', isBlack: false, keyboardKey: 'a' },
        { note: 'Re_komal', isBlack: true, keyboardKey: 'w' },
        { note: 'Re', isBlack: false, keyboardKey: 's' },
        { note: 'Ga_komal', isBlack: true, keyboardKey: 'e' },
        { note: 'Ga', isBlack: false, keyboardKey: 'd' },
        { note: 'Ma', isBlack: false, keyboardKey: 'f' },
        { note: 'Ma_tivra', isBlack: true, keyboardKey: 't' },
        { note: 'Pa', isBlack: false, keyboardKey: 'g' },
        { note: 'Dha_komal', isBlack: true, keyboardKey: 'y' },
        { note: 'Dha', isBlack: false, keyboardKey: 'h' },
        { note: 'Ni_komal', isBlack: true, keyboardKey: 'u' },
        { note: 'Ni', isBlack: false, keyboardKey: 'j' },
        { note: 'Sa_t', isBlack: false, keyboardKey: 'k' }
    ];

    /**
     * Initialize the keyboard
     * @param {string} containerId - Container element ID
     * @param {Object} options - Options
     */
    function init(containerId, options = {}) {
        container = document.getElementById(containerId);
        if (!container) {
            console.error('Harmonium container not found');
            return;
        }

        noteDisplayName = document.getElementById('harmonium-note-name');
        noteDisplayFreq = document.getElementById('harmonium-note-freq');

        onNotePlay = options.onNotePlay || null;
        onNoteStop = options.onNoteStop || null;

        createKeys();
        setupKeyboardListeners();
    }

    /**
     * Create harmonium keys
     */
    function createKeys() {
        container.innerHTML = '';

        let whiteKeyIndex = 0;

        OCTAVE_KEYS.forEach((keyDef, index) => {
            const key = document.createElement('div');
            key.className = `harmonium-key ${keyDef.isBlack ? 'black' : 'white'}`;
            key.dataset.note = keyDef.note;
            key.dataset.keyboardKey = keyDef.keyboardKey;

            // Label
            const label = document.createElement('span');
            label.className = 'key-label';
            const shortName = SwaraModule.SHORT_NAMES[keyDef.note] || keyDef.note;
            label.innerHTML = `${shortName}<br><small>${keyDef.keyboardKey.toUpperCase()}</small>`;
            key.appendChild(label);

            // Position black keys
            if (keyDef.isBlack) {
                // Black keys are positioned relative to white keys
                const leftOffset = whiteKeyIndex * 64 - 20; // 64px white key + margin, -20 to center
                key.style.left = `${leftOffset}px`;
            } else {
                whiteKeyIndex++;
            }

            // Mouse events
            key.addEventListener('mousedown', (e) => {
                e.preventDefault();
                playNote(keyDef.note);
            });

            key.addEventListener('mouseup', () => {
                stopNote(keyDef.note);
            });

            key.addEventListener('mouseleave', () => {
                if (activeKeys.has(keyDef.note)) {
                    stopNote(keyDef.note);
                }
            });

            // Touch events for mobile
            key.addEventListener('touchstart', (e) => {
                e.preventDefault();
                playNote(keyDef.note);
            });

            key.addEventListener('touchend', () => {
                stopNote(keyDef.note);
            });

            container.appendChild(key);
        });
    }

    /**
     * Setup keyboard listeners
     */
    function setupKeyboardListeners() {
        document.addEventListener('keydown', (e) => {
            // Ignore if typing in input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            const key = e.key.toLowerCase();
            const keyDef = OCTAVE_KEYS.find(k => k.keyboardKey === key);

            if (keyDef && !activeKeys.has(keyDef.note)) {
                playNote(keyDef.note);
            }
        });

        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            const keyDef = OCTAVE_KEYS.find(k => k.keyboardKey === key);

            if (keyDef) {
                stopNote(keyDef.note);
            }
        });
    }

    /**
     * Play a note
     * @param {string} note - Note name
     */
    function playNote(note) {
        if (activeKeys.has(note)) return;

        activeKeys.add(note);

        // Visual feedback
        const keyElement = container.querySelector(`[data-note="${note}"]`);
        if (keyElement) {
            keyElement.classList.add('active');
        }

        // Play sound
        const frequency = SwaraModule.getFrequency(note);
        OscillatorModule.playTone(frequency, `harmonium_${note}`, {
            type: 'triangle',
            volume: 0.4
        });

        // Update display
        if (noteDisplayName) {
            noteDisplayName.textContent = SwaraModule.SHORT_NAMES[note] || note;
        }
        if (noteDisplayFreq) {
            noteDisplayFreq.textContent = `${frequency.toFixed(1)} Hz`;
        }

        // Callback
        if (onNotePlay) {
            onNotePlay(note, frequency);
        }
    }

    /**
     * Stop a note
     * @param {string} note - Note name
     */
    function stopNote(note) {
        if (!activeKeys.has(note)) return;

        activeKeys.delete(note);

        // Visual feedback
        const keyElement = container.querySelector(`[data-note="${note}"]`);
        if (keyElement) {
            keyElement.classList.remove('active');
        }

        // Stop sound
        OscillatorModule.stopTone(`harmonium_${note}`);

        // Clear display if no keys active
        if (activeKeys.size === 0) {
            if (noteDisplayName) noteDisplayName.textContent = '--';
            if (noteDisplayFreq) noteDisplayFreq.textContent = '-- Hz';
        }

        // Callback
        if (onNoteStop) {
            onNoteStop(note);
        }
    }

    /**
     * Stop all notes
     */
    function stopAll() {
        activeKeys.forEach(note => stopNote(note));
    }

    /**
     * Highlight a key (for demonstration)
     * @param {string} note - Note to highlight
     * @param {number} duration - Duration in ms
     */
    function highlightKey(note, duration = 500) {
        const keyElement = container.querySelector(`[data-note="${note}"]`);
        if (keyElement) {
            keyElement.classList.add('active');
            setTimeout(() => {
                keyElement.classList.remove('active');
            }, duration);
        }
    }

    /**
     * Get active keys
     * @returns {Set}
     */
    function getActiveKeys() {
        return new Set(activeKeys);
    }

    // Public API
    return {
        init,
        playNote,
        stopNote,
        stopAll,
        highlightKey,
        getActiveKeys
    };
})();

// Make available globally
window.HarmoniumKeyboard = HarmoniumKeyboard;
