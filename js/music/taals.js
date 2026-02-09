/**
 * Taals Module
 * Defines Indian classical rhythm patterns
 */

const TaalModule = (function () {
    'use strict';

    // Taal definitions
    const TAALS = {
        teentaal: {
            name: 'Teentaal',
            nameHindi: 'तीनताल',
            beats: 16,
            divisions: [4, 4, 4, 4],
            vibhags: 4,
            sam: 1,
            khali: 9,
            tali: [1, 5, 13],
            bols: [
                'Dha', 'Dhin', 'Dhin', 'Dha',
                'Dha', 'Dhin', 'Dhin', 'Dha',
                'Dha', 'Tin', 'Tin', 'Ta',
                'Ta', 'Dhin', 'Dhin', 'Dha'
            ],
            description: 'The most common taal in Hindustani classical music. 16 beats in 4 divisions.'
        },

        ektaal: {
            name: 'Ektaal',
            nameHindi: 'एकताल',
            beats: 12,
            divisions: [2, 2, 2, 2, 2, 2],
            vibhags: 6,
            sam: 1,
            khali: 7,
            tali: [1, 3, 5, 9, 11],
            bols: [
                'Dhin', 'Dhin',
                'Dhage', 'Tirakita',
                'Tu', 'Na',
                'Kat', 'Ta',
                'Dhage', 'Tirakita',
                'Dhin', 'Na'
            ],
            description: 'A 12-beat taal commonly used in khayal and dhrupad.'
        },

        jhaptaal: {
            name: 'Jhaptaal',
            nameHindi: 'झपताल',
            beats: 10,
            divisions: [2, 3, 2, 3],
            vibhags: 4,
            sam: 1,
            khali: 6,
            tali: [1, 3, 8],
            bols: [
                'Dhi', 'Na',
                'Dhi', 'Dhi', 'Na',
                'Ti', 'Na',
                'Dhi', 'Dhi', 'Na'
            ],
            description: 'A popular 10-beat taal with asymmetric divisions.'
        },

        dadra: {
            name: 'Dadra',
            nameHindi: 'दादरा',
            beats: 6,
            divisions: [3, 3],
            vibhags: 2,
            sam: 1,
            khali: 4,
            tali: [1],
            bols: [
                'Dha', 'Dhin', 'Na',
                'Dha', 'Tin', 'Na'
            ],
            description: 'A light 6-beat taal used in semi-classical and folk music.'
        },

        keherwa: {
            name: 'Keherwa',
            nameHindi: 'कहरवा',
            beats: 8,
            divisions: [4, 4],
            vibhags: 2,
            sam: 1,
            khali: 5,
            tali: [1],
            bols: [
                'Dha', 'Ge', 'Na', 'Ti',
                'Na', 'Ka', 'Dhi', 'Na'
            ],
            description: 'An 8-beat taal popular in light music, bhajans, and folk songs.'
        },

        roopak: {
            name: 'Roopak',
            nameHindi: 'रूपक',
            beats: 7,
            divisions: [3, 2, 2],
            vibhags: 3,
            sam: 1,
            khali: 1,
            tali: [4, 6],
            bols: [
                'Ti', 'Ti', 'Na',
                'Dhi', 'Na',
                'Dhi', 'Na'
            ],
            description: 'A unique 7-beat taal where sam coincides with khali.'
        },

        chautaal: {
            name: 'Chautaal',
            nameHindi: 'चौताल',
            beats: 12,
            divisions: [2, 2, 2, 2, 2, 2],
            vibhags: 6,
            sam: 1,
            khali: 9,
            tali: [1, 3, 5, 7, 11],
            bols: [
                'Dha', 'Dha',
                'Dhin', 'Ta',
                'Tita', 'Dha',
                'Dha', 'Dhin',
                'Ta', 'Tita',
                'Kat', 'Ta'
            ],
            description: 'A stately 12-beat taal used in dhrupad compositions.'
        },

        rupakTaal: {
            name: 'Rupak Taal',
            nameHindi: 'रुपक ताल',
            beats: 7,
            divisions: [3, 2, 2],
            vibhags: 3,
            sam: 1,
            khali: 1,
            tali: [4, 6],
            bols: [
                'Tin', 'Tin', 'Na',
                'Dhin', 'Na',
                'Dhin', 'Na'
            ],
            description: 'Seven-beat cycle, starts with khali on sam - unique among taals.'
        }
    };

    /**
     * Get all taal keys
     * @returns {string[]} Array of taal keys
     */
    function getAllTaalKeys() {
        return Object.keys(TAALS);
    }

    /**
     * Get taal by key
     * @param {string} key - Taal key
     * @returns {Object|null} Taal object or null
     */
    function getTaal(key) {
        return TAALS[key] || null;
    }

    /**
     * Get all taals
     * @returns {Object} All taal objects
     */
    function getAllTaals() {
        return TAALS;
    }

    /**
     * Get beat info for a specific beat in a taal
     * @param {string} taalKey - Taal key
     * @param {number} beatNum - Beat number (1-indexed)
     * @returns {Object} Beat information
     */
    function getBeatInfo(taalKey, beatNum) {
        const taal = TAALS[taalKey];
        if (!taal || beatNum < 1 || beatNum > taal.beats) {
            return null;
        }

        return {
            number: beatNum,
            bol: taal.bols[beatNum - 1],
            isSam: beatNum === taal.sam,
            isKhali: beatNum === taal.khali,
            isTali: taal.tali.includes(beatNum),
            vibhag: getVibhag(taal, beatNum)
        };
    }

    /**
     * Get which vibhag a beat belongs to
     * @param {Object} taal - Taal object
     * @param {number} beatNum - Beat number
     * @returns {number} Vibhag number (1-indexed)
     */
    function getVibhag(taal, beatNum) {
        let count = 0;
        for (let i = 0; i < taal.divisions.length; i++) {
            count += taal.divisions[i];
            if (beatNum <= count) {
                return i + 1;
            }
        }
        return 1;
    }

    /**
     * Calculate tempo interval in milliseconds
     * @param {number} bpm - Beats per minute
     * @returns {number} Interval in milliseconds
     */
    function calculateInterval(bpm) {
        return (60 / bpm) * 1000;
    }

    /**
     * Get taal categories by beats
     * @returns {Object} Grouped taals
     */
    function getTaalsByBeats() {
        const grouped = {};
        for (const [key, taal] of Object.entries(TAALS)) {
            const beats = taal.beats;
            if (!grouped[beats]) {
                grouped[beats] = [];
            }
            grouped[beats].push({ key, ...taal });
        }
        return grouped;
    }

    // Public API
    return {
        getAllTaalKeys,
        getTaal,
        getAllTaals,
        getBeatInfo,
        getVibhag,
        calculateInterval,
        getTaalsByBeats,
        TAALS
    };
})();

// Make available globally
window.TaalModule = TaalModule;
