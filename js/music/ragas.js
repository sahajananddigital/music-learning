/**
 * Ragas Module
 * Defines common Indian classical ragas with their characteristics
 */

const RagaModule = (function () {
    'use strict';

    // Raga definitions
    const RAGAS = {
        yaman: {
            name: 'Yaman',
            nameHindi: 'यमन',
            thaat: 'Kalyan',
            time: 'First prahar of night (6-9 PM)',
            timeIcon: '🌙',
            mood: 'Romantic, devotional, majestic',
            vadi: 'Ga',
            samvadi: 'Ni',
            aaroh: ['Ni_m', 'Re', 'Ga', 'Ma_tivra', 'Dha', 'Ni', 'Sa_t'],
            avroh: ['Sa_t', 'Ni', 'Dha', 'Pa', 'Ma_tivra', 'Ga', 'Re', 'Sa'],
            swaras: ['Sa', 'Re', 'Ga', 'Ma_tivra', 'Pa', 'Dha', 'Ni'],
            pakad: ['Ni_m', 'Re', 'Ga', 'Re', 'Sa'],
            description: 'One of the most fundamental ragas, often the first taught to students. Known for its serene and romantic mood.'
        },

        bhairavi: {
            name: 'Bhairavi',
            nameHindi: 'भैरवी',
            thaat: 'Bhairavi',
            time: 'Early morning (3-6 AM) or conclusion',
            timeIcon: '🌅',
            mood: 'Devotional, serene, melancholic',
            vadi: 'Ma',
            samvadi: 'Sa',
            aaroh: ['Sa', 'Re_komal', 'Ga_komal', 'Ma', 'Pa', 'Dha_komal', 'Ni_komal', 'Sa_t'],
            avroh: ['Sa_t', 'Ni_komal', 'Dha_komal', 'Pa', 'Ma', 'Ga_komal', 'Re_komal', 'Sa'],
            swaras: ['Sa', 'Re_komal', 'Ga_komal', 'Ma', 'Pa', 'Dha_komal', 'Ni_komal'],
            pakad: ['Ma', 'Ga_komal', 'Re_komal', 'Sa', 'Dha_m_komal', 'Ni_m_komal', 'Sa'],
            description: 'The queen of ragas, traditionally sung at the end of a concert. Uses all komal (flat) notes.'
        },

        bhairav: {
            name: 'Bhairav',
            nameHindi: 'भैरव',
            thaat: 'Bhairav',
            time: 'Early morning (sandhiprakash)',
            timeIcon: '🌄',
            mood: 'Serious, majestic, devotional',
            vadi: 'Dha',
            samvadi: 'Re',
            aaroh: ['Sa', 'Re_komal', 'Ga', 'Ma', 'Pa', 'Dha_komal', 'Ni', 'Sa_t'],
            avroh: ['Sa_t', 'Ni', 'Dha_komal', 'Pa', 'Ma', 'Ga', 'Re_komal', 'Sa'],
            swaras: ['Sa', 'Re_komal', 'Ga', 'Ma', 'Pa', 'Dha_komal', 'Ni'],
            pakad: ['Ga', 'Ma', 'Dha_komal', 'Pa', 'Ga', 'Ma', 'Re_komal', 'Sa'],
            description: 'A morning raga with a serious and devotional mood. Named after Lord Shiva in his fierce form.'
        },

        bilawal: {
            name: 'Bilawal',
            nameHindi: 'बिलावल',
            thaat: 'Bilawal',
            time: 'Morning (9 AM - 12 PM)',
            timeIcon: '☀️',
            mood: 'Bright, cheerful, auspicious',
            vadi: 'Dha',
            samvadi: 'Ga',
            aaroh: ['Sa', 'Re', 'Ga', 'Pa', 'Dha', 'Sa_t'],
            avroh: ['Sa_t', 'Ni', 'Dha', 'Pa', 'Ma', 'Ga', 'Re', 'Sa'],
            swaras: ['Sa', 'Re', 'Ga', 'Ma', 'Pa', 'Dha', 'Ni'],
            pakad: ['Ga', 'Re', 'Sa', 'Dha_m', 'Pa_m', 'Ga', 'Re', 'Sa'],
            description: 'Uses all shuddha (natural) notes, equivalent to Western C major scale. Bright and cheerful mood.'
        },

        kafi: {
            name: 'Kafi',
            nameHindi: 'काफ़ी',
            thaat: 'Kafi',
            time: 'Late night',
            timeIcon: '🌃',
            mood: 'Light romantic, playful',
            vadi: 'Pa',
            samvadi: 'Sa',
            aaroh: ['Sa', 'Re', 'Ga_komal', 'Ma', 'Pa', 'Dha', 'Ni_komal', 'Sa_t'],
            avroh: ['Sa_t', 'Ni_komal', 'Dha', 'Pa', 'Ma', 'Ga_komal', 'Re', 'Sa'],
            swaras: ['Sa', 'Re', 'Ga_komal', 'Ma', 'Pa', 'Dha', 'Ni_komal'],
            pakad: ['Ma', 'Ga_komal', 'Re', 'Sa', 'Ni_m_komal', 'Sa'],
            description: 'A popular raga in light classical and folk music. Uses komal Ga and Ni.'
        },

        durga: {
            name: 'Durga',
            nameHindi: 'दुर्गा',
            thaat: 'Bilawal',
            time: 'Evening (9 PM - 12 AM)',
            timeIcon: '🌙',
            mood: 'Powerful, devotional, courageous',
            vadi: 'Ma',
            samvadi: 'Sa',
            aaroh: ['Sa', 'Re', 'Ma', 'Pa', 'Dha', 'Sa_t'],
            avroh: ['Sa_t', 'Dha', 'Pa', 'Ma', 'Re', 'Sa'],
            swaras: ['Sa', 'Re', 'Ma', 'Pa', 'Dha'],
            pakad: ['Ma', 'Re', 'Sa', 'Dha_m', 'Sa'],
            description: 'A pentatonic raga (5 notes) named after Goddess Durga. Omits Ga and Ni.'
        },

        todi: {
            name: 'Todi',
            nameHindi: 'तोड़ी',
            thaat: 'Todi',
            time: 'Late morning (9 AM - 12 PM)',
            timeIcon: '🌞',
            mood: 'Serious, pathos, yearning',
            vadi: 'Dha',
            samvadi: 'Ga',
            aaroh: ['Sa', 'Re_komal', 'Ga_komal', 'Ma_tivra', 'Pa', 'Dha_komal', 'Ni', 'Sa_t'],
            avroh: ['Sa_t', 'Ni', 'Dha_komal', 'Pa', 'Ma_tivra', 'Ga_komal', 'Re_komal', 'Sa'],
            swaras: ['Sa', 'Re_komal', 'Ga_komal', 'Ma_tivra', 'Pa', 'Dha_komal', 'Ni'],
            pakad: ['Dha_komal', 'Ni', 'Sa_t', 'Re_t_komal', 'Sa_t', 'Ni', 'Dha_komal', 'Pa'],
            description: 'A serious and profound raga with characteristic komal Re, Ga, Dha and tivra Ma.'
        },

        marwa: {
            name: 'Marwa',
            nameHindi: 'मारवा',
            thaat: 'Marwa',
            time: 'Sunset (sandhiprakash)',
            timeIcon: '🌅',
            mood: 'Serious, anticipation, restlessness',
            vadi: 'Re',
            samvadi: 'Dha',
            aaroh: ['Ni_m', 'Re_komal', 'Ga', 'Ma_tivra', 'Dha', 'Ni', 'Sa_t'],
            avroh: ['Ni', 'Dha', 'Ma_tivra', 'Ga', 'Re_komal', 'Ni_m', 'Re_komal', 'Sa'],
            swaras: ['Sa', 'Re_komal', 'Ga', 'Ma_tivra', 'Dha', 'Ni'],
            pakad: ['Ni_m', 'Re_komal', 'Ga', 'Re_komal', 'Ni_m', 'Re_komal', 'Sa'],
            description: 'A sunset raga that avoids Pa. Known for its unique, restless character.'
        },

        malkauns: {
            name: 'Malkauns',
            nameHindi: 'मालकौंस',
            thaat: 'Bhairavi',
            time: 'Midnight',
            timeIcon: '🌌',
            mood: 'Serious, meditative, mysterious',
            vadi: 'Ma',
            samvadi: 'Sa',
            aaroh: ['Sa', 'Ga_komal', 'Ma', 'Dha_komal', 'Ni_komal', 'Sa_t'],
            avroh: ['Sa_t', 'Ni_komal', 'Dha_komal', 'Ma', 'Ga_komal', 'Sa'],
            swaras: ['Sa', 'Ga_komal', 'Ma', 'Dha_komal', 'Ni_komal'],
            pakad: ['Ma', 'Ni_m_komal', 'Dha_m_komal', 'Ma', 'Ga_komal', 'Sa'],
            description: 'A pentatonic midnight raga with deep, meditative mood. Omits Re and Pa.'
        },

        desh: {
            name: 'Desh',
            nameHindi: 'देश',
            thaat: 'Khamaj',
            time: 'Second prahar of night',
            timeIcon: '🌙',
            mood: 'Romantic, expressive, patriotic',
            vadi: 'Re',
            samvadi: 'Pa',
            aaroh: ['Sa', 'Re', 'Ma', 'Pa', 'Ni', 'Sa_t'],
            avroh: ['Sa_t', 'Ni', 'Dha', 'Pa', 'Ma', 'Ga', 'Re', 'Sa'],
            swaras: ['Sa', 'Re', 'Ga', 'Ma', 'Pa', 'Dha', 'Ni', 'Ni_komal'],
            pakad: ['Re', 'Ma', 'Pa', 'Ni', 'Dha', 'Pa', 'Ma', 'Ga', 'Re', 'Sa'],
            description: 'A light classical raga, very popular in Hindi film music and patriotic songs.'
        }
    };

    /**
     * Get all raga names
     * @returns {string[]} Array of raga keys
     */
    function getAllRagaKeys() {
        return Object.keys(RAGAS);
    }

    /**
     * Get raga by key
     * @param {string} key - Raga key (e.g., 'yaman')
     * @returns {Object|null} Raga object or null
     */
    function getRaga(key) {
        return RAGAS[key] || null;
    }

    /**
     * Get all ragas
     * @returns {Object} All raga objects
     */
    function getAllRagas() {
        return RAGAS;
    }

    /**
     * Get ragas by thaat
     * @param {string} thaat - Thaat name
     * @returns {Object[]} Array of ragas
     */
    function getRagasByThaat(thaat) {
        return Object.values(RAGAS).filter(raga => raga.thaat === thaat);
    }

    /**
     * Get ragas by time of day
     * @param {string} time - Time keyword (morning, evening, night)
     * @returns {Object[]} Array of ragas
     */
    function getRagasByTime(time) {
        const timeLC = time.toLowerCase();
        return Object.values(RAGAS).filter(raga =>
            raga.time.toLowerCase().includes(timeLC)
        );
    }

    /**
     * Check if a swara is used in a raga
     * @param {string} ragaKey - Raga key
     * @param {string} swara - Swara name
     * @returns {boolean}
     */
    function isSwaraInRaga(ragaKey, swara) {
        const raga = RAGAS[ragaKey];
        if (!raga) return false;
        return raga.swaras.includes(swara);
    }

    // Public API
    return {
        getAllRagaKeys,
        getRaga,
        getAllRagas,
        getRagasByThaat,
        getRagasByTime,
        isSwaraInRaga,
        RAGAS
    };
})();

// Make available globally
window.RagaModule = RagaModule;
