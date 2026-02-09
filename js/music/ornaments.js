/**
 * Ornaments Module
 * Defines Indian classical music ornaments (alankar)
 */

const OrnamentModule = (function () {
    'use strict';

    // Ornament definitions
    const ORNAMENTS = {
        meend: {
            name: 'Meend',
            nameHindi: 'मींड',
            description: 'A smooth, continuous glide from one note to another. The voice or instrument slides through all microtones between the two notes.',
            technique: 'Sing the starting note, then gradually slide your voice to the target note without any breaks.',
            example: {
                from: 'Sa',
                to: 'Ga',
                duration: 2000, // ms
                pattern: 'ascending'
            },
            difficulty: 'intermediate',
            tips: [
                'Maintain even breath support throughout the glide',
                'The slide should be smooth, not stepwise',
                'Control the speed of the glide - slower is often harder'
            ]
        },

        khatka: {
            name: 'Khatka',
            nameHindi: 'खटका',
            description: 'Quick, sharp grace notes that ornament the main note. Like a rapid flick or jerk in the voice.',
            technique: 'While sustaining the main note, quickly touch the adjacent note and return.',
            example: {
                mainNote: 'Ga',
                graceNote: 'Re',
                pattern: [1, 0.1, 1], // relative duration
                speed: 'fast'
            },
            difficulty: 'intermediate',
            tips: [
                'The grace note should be very brief',
                'Keep the main note as the focus',
                'Practice slowly, then gradually increase speed'
            ]
        },

        murki: {
            name: 'Murki',
            nameHindi: 'मुर्की',
            description: 'A cluster of 3-4 notes sung in rapid succession. Creates a sparkling, ornamental effect.',
            technique: 'String together several notes very quickly, almost blending them together.',
            example: {
                notes: ['Ga', 'Ma', 'Pa', 'Ma', 'Ga'],
                speed: 'very fast',
                duration: 500
            },
            difficulty: 'advanced',
            tips: [
                'All notes should be clearly articulated despite the speed',
                'Practice the pattern slowly first',
                'Murki often ends on the starting note'
            ]
        },

        andolan: {
            name: 'Andolan',
            nameHindi: 'आंदोलन',
            description: 'A gentle, slow oscillation around a note, creating a wavering effect. Different from vibrato.',
            technique: 'While sustaining a note, gently oscillate the pitch slightly above and below.',
            example: {
                centerNote: 'Dha_komal',
                oscillationRange: 20, // cents
                speed: 'slow'
            },
            difficulty: 'intermediate',
            tips: [
                'The oscillation should be very subtle',
                'Used especially on komal (flat) notes in certain ragas',
                'Maintain consistent breath support'
            ]
        },

        gamak: {
            name: 'Gamak',
            nameHindi: 'गमक',
            description: 'Strong, forceful oscillation between two notes, creating a powerful shake effect.',
            technique: 'Alternate rapidly between two adjacent notes with force from the diaphragm.',
            example: {
                note1: 'Pa',
                note2: 'Ma',
                pattern: 'alternating',
                speed: 'medium-fast'
            },
            difficulty: 'advanced',
            tips: [
                'Each note should be distinctly hit',
                'Requires good breath and diaphragm control',
                'Common in dhrupad style singing'
            ]
        },

        kan: {
            name: 'Kan Swara',
            nameHindi: 'कण स्वर',
            description: 'A very brief touch of an adjacent note before landing on the main note. Like a grace note.',
            technique: 'Lightly touch the grace note before singing the main note. The grace note is extremely brief.',
            example: {
                graceNote: 'Re',
                mainNote: 'Ga',
                graceRatio: 0.1
            },
            difficulty: 'beginner',
            tips: [
                'The kan should be almost imperceptible',
                'It adds color and connection between notes',
                'Very common in all forms of Indian classical music'
            ]
        }
    };

    /**
     * Get all ornament keys
     * @returns {string[]} Array of ornament keys
     */
    function getAllOrnamentKeys() {
        return Object.keys(ORNAMENTS);
    }

    /**
     * Get ornament by key
     * @param {string} key - Ornament key
     * @returns {Object|null} Ornament object or null
     */
    function getOrnament(key) {
        return ORNAMENTS[key] || null;
    }

    /**
     * Get all ornaments
     * @returns {Object} All ornament objects
     */
    function getAllOrnaments() {
        return ORNAMENTS;
    }

    /**
     * Get ornaments by difficulty
     * @param {string} difficulty - Difficulty level
     * @returns {Object[]} Array of ornaments
     */
    function getOrnamentsByDifficulty(difficulty) {
        return Object.entries(ORNAMENTS)
            .filter(([, ornament]) => ornament.difficulty === difficulty)
            .map(([key, ornament]) => ({ key, ...ornament }));
    }

    /**
     * Generate frequency pattern for meend
     * @param {number} fromFreq - Starting frequency
     * @param {number} toFreq - Ending frequency
     * @param {number} steps - Number of steps
     * @returns {number[]} Array of frequencies
     */
    function generateMeendPattern(fromFreq, toFreq, steps = 50) {
        const frequencies = [];
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            // Use easing for natural feel
            const eased = t * t * (3 - 2 * t); // smoothstep
            frequencies.push(fromFreq + (toFreq - fromFreq) * eased);
        }
        return frequencies;
    }

    /**
     * Generate frequency pattern for khatka
     * @param {number} mainFreq - Main note frequency
     * @param {number} graceFreq - Grace note frequency
     * @returns {Object[]} Array of {freq, duration} objects
     */
    function generateKhatkaPattern(mainFreq, graceFreq) {
        return [
            { freq: mainFreq, duration: 150 },
            { freq: graceFreq, duration: 50 },
            { freq: mainFreq, duration: 200 }
        ];
    }

    /**
     * Generate frequency pattern for andolan
     * @param {number} centerFreq - Center frequency
     * @param {number} rangeCents - Oscillation range in cents
     * @param {number} duration - Total duration in ms
     * @param {number} rate - Oscillation rate in Hz
     * @returns {Object[]} Array of {time, freq} objects
     */
    function generateAndolanPattern(centerFreq, rangeCents = 20, duration = 2000, rate = 2) {
        const points = [];
        const step = 20; // ms
        for (let t = 0; t <= duration; t += step) {
            const phase = (t / 1000) * rate * 2 * Math.PI;
            const centOffset = Math.sin(phase) * rangeCents;
            const freq = centerFreq * Math.pow(2, centOffset / 1200);
            points.push({ time: t, freq });
        }
        return points;
    }

    // Public API
    return {
        getAllOrnamentKeys,
        getOrnament,
        getAllOrnaments,
        getOrnamentsByDifficulty,
        generateMeendPattern,
        generateKhatkaPattern,
        generateAndolanPattern,
        ORNAMENTS
    };
})();

// Make available globally
window.OrnamentModule = OrnamentModule;
