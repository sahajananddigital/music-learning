/**
 * Swaras (Notes) Module
 * Defines Indian classical music note frequencies and mappings
 */

const SwaraModule = (function() {
    'use strict';

    // Base frequency for Sa (can be configured)
    let baseFrequency = 240;
    let currentScale = 'Manual';

    // Western scales mapping to frequencies (Middle Octave)
    const SCALES = {
        'C': 261.63,
        'C#': 277.18,
        'D': 293.66,
        'D#': 311.13,
        'E': 329.63,
        'F': 349.23,
        'F#': 369.99,
        'G': 392.00,
        'G#': 415.30,
        'A': 440.00,
        'A#': 466.16,
        'B': 493.88
    };

    // Frequency ratios for swaras (Just Intonation)
    const SWARA_RATIOS = {
        // Mandra Saptak (Lower octave) - multiply by 0.5
        'Sa_m': 0.5,
        'Re_m': 0.5625,
        'Re_m_komal': 0.533,
        'Ga_m': 0.625,
        'Ga_m_komal': 0.6,
        'Ma_m': 0.667,
        'Ma_m_tivra': 0.703,
        'Pa_m': 0.75,
        'Dha_m': 0.844,
        'Dha_m_komal': 0.8,
        'Ni_m': 0.9375,
        'Ni_m_komal': 0.9,

        // Madhya Saptak (Middle octave) - base
        'Sa': 1,
        'Re': 1.125,
        'Re_komal': 1.0667,
        'Ga': 1.25,
        'Ga_komal': 1.2,
        'Ma': 1.333,
        'Ma_tivra': 1.406,
        'Pa': 1.5,
        'Dha': 1.6875,
        'Dha_komal': 1.6,
        'Ni': 1.875,
        'Ni_komal': 1.8,

        // Taar Saptak (Higher octave) - multiply by 2
        'Sa_t': 2,
        'Re_t': 2.25,
        'Re_t_komal': 2.133,
        'Ga_t': 2.5,
        'Ga_t_komal': 2.4,
        'Ma_t': 2.667,
        'Ma_t_tivra': 2.812,
        'Pa_t': 3,
        'Dha_t': 3.375,
        'Dha_t_komal': 3.2,
        'Ni_t': 3.75,
        'Ni_t_komal': 3.6
    };

    // Display names for swaras
    const SWARA_NAMES = {
        'Sa': 'Sa (षड्ज)',
        'Re': 'Re (ऋषभ)',
        'Re_komal': 'Re♭ (कोमल)',
        'Ga': 'Ga (गांधार)',
        'Ga_komal': 'Ga♭ (कोमल)',
        'Ma': 'Ma (मध्यम)',
        'Ma_tivra': 'Ma♯ (तीव्र)',
        'Pa': 'Pa (पंचम)',
        'Dha': 'Dha (धैवत)',
        'Dha_komal': 'Dha♭ (कोमल)',
        'Ni': 'Ni (निषाद)',
        'Ni_komal': 'Ni♭ (कोमल)'
    };

    // Short names for display
    const SHORT_NAMES = {
        'Sa': 'Sa', 'Re': 'Re', 'Re_komal': 'Re♭',
        'Ga': 'Ga', 'Ga_komal': 'Ga♭',
        'Ma': 'Ma', 'Ma_tivra': 'Ma♯',
        'Pa': 'Pa',
        'Dha': 'Dha', 'Dha_komal': 'Dha♭',
        'Ni': 'Ni', 'Ni_komal': 'Ni♭'
    };

    // Keyboard mapping for harmonium
    const KEYBOARD_MAP = {
        'a': 'Sa',
        'w': 'Re_komal',
        's': 'Re',
        'e': 'Ga_komal',
        'd': 'Ga',
        'f': 'Ma',
        't': 'Ma_tivra',
        'g': 'Pa',
        'y': 'Dha_komal',
        'h': 'Dha',
        'u': 'Ni_komal',
        'j': 'Ni',
        'k': 'Sa_t'
    };

    /**
     * Set the base frequency for Sa
     * @param {number} freq - Base frequency in Hz
     */
    function setBaseFrequency(freq) {
        baseFrequency = freq;
        currentScale = 'Manual';
    }

    /**
     * Get current base frequency
     * @returns {number} Base frequency in Hz
     */
    function getBaseFrequency() {
        return baseFrequency;
    }

    /**
     * Set scale by Western note name
     * @param {string} scaleName - Western note (e.g., 'C#')
     */
    function setScale(scaleName) {
        if (SCALES[scaleName]) {
            baseFrequency = SCALES[scaleName];
            currentScale = scaleName;
            return true;
        }
        return false;
    }

    /**
     * Get current scale name
     * @returns {string} Scale name or 'Manual'
     */
    function getScale() {
        return currentScale;
    }

    /**
     * Get all available scales
     * @returns {Object}
     */
    function getScales() {
        return SCALES;
    }

    /**
     * Get frequency for a specific swara
     * @param {string} swara - Swara name (e.g., 'Sa', 'Re_komal')
     * @returns {number} Frequency in Hz
     */
    function getFrequency(swara) {
        const ratio = SWARA_RATIOS[swara];
        if (ratio === undefined) {
            console.warn(`Unknown swara: ${swara}`);
            return baseFrequency;
        }
        return baseFrequency * ratio;
    }

    /**
     * Get all frequencies for current base
     * @returns {Object} Object with swara names and frequencies
     */
    function getAllFrequencies() {
        const frequencies = {};
        for (const [swara, ratio] of Object.entries(SWARA_RATIOS)) {
            frequencies[swara] = baseFrequency * ratio;
        }
        return frequencies;
    }

    /**
     * Detect which swara a frequency corresponds to
     * @param {number} freq - Frequency in Hz
     * @param {number} tolerance - Tolerance in cents (default 50)
     * @returns {Object|null} Object with swara info or null if not matched
     */
    function detectSwara(freq, tolerance = 50) {
        if (freq < 50 || freq > 2000) return null;

        const allFreqs = getAllFrequencies();
        let closestSwara = null;
        let closestCents = Infinity;

        for (const [swara, swaraFreq] of Object.entries(allFreqs)) {
            const cents = 1200 * Math.log2(freq / swaraFreq);
            const absCents = Math.abs(cents);
            
            if (absCents < closestCents) {
                closestCents = absCents;
                closestSwara = {
                    name: swara,
                    shortName: SHORT_NAMES[swara.replace(/_[mt]$/, '')] || swara,
                    frequency: swaraFreq,
                    detectedFreq: freq,
                    cents: cents,
                    isMatch: absCents <= tolerance
                };
            }
        }

        return closestSwara;
    }

    /**
     * Get the accuracy of a sung note compared to target
     * @param {number} sungFreq - Sung frequency
     * @param {string} targetSwara - Target swara name
     * @returns {Object} Accuracy information
     */
    function getAccuracy(sungFreq, targetSwara) {
        const targetFreq = getFrequency(targetSwara);
        const cents = 1200 * Math.log2(sungFreq / targetFreq);
        
        let status = 'correct';
        let direction = 0;
        
        if (cents > 20) {
            status = 'high';
            direction = 1;
        } else if (cents < -20) {
            status = 'low';
            direction = -1;
        }

        return {
            targetFreq,
            sungFreq,
            cents,
            status,
            direction,
            percentage: Math.max(0, 100 - Math.abs(cents))
        };
    }

    /**
     * Get main swaras for practice (madhya saptak only)
     * @returns {string[]} Array of swara names
     */
    function getMainSwaras() {
        return ['Sa', 'Re', 'Ga', 'Ma', 'Pa', 'Dha', 'Ni'];
    }

    /**
     * Get all swaras including komal and tivra
     * @returns {string[]} Array of all swara names
     */
    function getAllSwaras() {
        return [
            'Sa', 'Re_komal', 'Re', 'Ga_komal', 'Ga', 
            'Ma', 'Ma_tivra', 'Pa', 
            'Dha_komal', 'Dha', 'Ni_komal', 'Ni'
        ];
    }

    // Public API
    return {
        setBaseFrequency,
        getBaseFrequency,
        setScale,
        getScale,
        getScales,
        getFrequency,
        getAllFrequencies,
        detectSwara,
        getAccuracy,
        getMainSwaras,
        getAllSwaras,
        SWARA_NAMES,
        SHORT_NAMES,
        KEYBOARD_MAP,
        SWARA_RATIOS
    };
})();

// Make available globally
window.SwaraModule = SwaraModule;
