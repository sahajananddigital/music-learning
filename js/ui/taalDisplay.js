/**
 * Taal Display UI
 * Visual taal display with beat indicators
 */

const TaalDisplay = (function () {
    'use strict';

    let container = null;
    let currentBeatDisplay = null;
    let currentBolDisplay = null;
    let currentTaal = null;
    let currentBeat = 0;
    let taalController = null;
    let isPlaying = false;

    /**
     * Initialize the taal display
     * @param {string} containerId - Container element ID
     */
    function init(containerId) {
        container = document.getElementById(containerId);
        currentBeatDisplay = document.getElementById('current-beat');
        currentBolDisplay = document.getElementById('current-bol');

        if (!container) {
            console.error('Taal container not found');
        }
    }

    /**
     * Load a taal and display its beats
     * @param {string} taalKey - Taal key from TaalModule
     */
    function loadTaal(taalKey) {
        currentTaal = TaalModule.getTaal(taalKey);
        if (!currentTaal) {
            console.error('Taal not found:', taalKey);
            return;
        }

        currentBeat = 0;
        renderBeats();
    }

    /**
     * Render taal beats
     */
    function renderBeats() {
        if (!container || !currentTaal) return;

        container.innerHTML = '';

        for (let i = 0; i < currentTaal.beats; i++) {
            const beatNum = i + 1;
            const beatInfo = TaalModule.getBeatInfo(
                currentTaal.name.toLowerCase().replace(' ', ''),
                beatNum
            );

            const beatElement = document.createElement('div');
            beatElement.className = 'taal-beat';
            beatElement.dataset.beat = beatNum;

            // Add special classes
            if (beatInfo.isSam) {
                beatElement.classList.add('sam');
            }
            if (beatInfo.isKhali) {
                beatElement.classList.add('khali');
            }

            // Beat number
            const numberSpan = document.createElement('span');
            numberSpan.className = 'beat-number';
            numberSpan.textContent = beatNum;
            beatElement.appendChild(numberSpan);

            // Bol
            const bolSpan = document.createElement('span');
            bolSpan.className = 'beat-bol';
            bolSpan.textContent = currentTaal.bols[i];
            beatElement.appendChild(bolSpan);

            // Marker (X for khali, number for tali)
            const markerSpan = document.createElement('span');
            markerSpan.className = 'beat-marker';
            if (beatInfo.isSam) {
                markerSpan.textContent = 'X';
            } else if (beatInfo.isKhali) {
                markerSpan.textContent = '0';
            } else if (beatInfo.isTali) {
                markerSpan.textContent = TaalModule.getVibhag(currentTaal, beatNum);
            }
            beatElement.appendChild(markerSpan);

            container.appendChild(beatElement);
        }
    }

    /**
     * Start the taal
     * @param {number} bpm - Beats per minute
     */
    function start(bpm = 80) {
        if (!currentTaal || isPlaying) return;

        isPlaying = true;
        currentBeat = 0;

        taalController = OscillatorModule.playTaal(
            currentTaal,
            bpm,
            (beatNum, beatInfo) => {
                highlightBeat(beatNum);
                updateBeatInfo(beatNum, beatInfo);
            }
        );
    }

    /**
     * Stop the taal
     */
    function stop() {
        if (taalController) {
            taalController.stop();
            taalController = null;
        }
        isPlaying = false;
        clearHighlight();

        if (currentBeatDisplay) currentBeatDisplay.textContent = '-';
        if (currentBolDisplay) currentBolDisplay.textContent = '-';
    }

    /**
     * Highlight a specific beat
     * @param {number} beatNum - Beat number (1-indexed)
     */
    function highlightBeat(beatNum) {
        // Clear previous highlight
        const prevActive = container.querySelector('.taal-beat.active');
        if (prevActive) {
            prevActive.classList.remove('active');
        }

        // Highlight current beat
        const currentElement = container.querySelector(`[data-beat="${beatNum}"]`);
        if (currentElement) {
            currentElement.classList.add('active');
        }

        currentBeat = beatNum;
    }

    /**
     * Update beat info display
     * @param {number} beatNum 
     * @param {Object} beatInfo 
     */
    function updateBeatInfo(beatNum, beatInfo) {
        if (currentBeatDisplay) {
            currentBeatDisplay.textContent = beatNum;
        }
        if (currentBolDisplay && beatInfo) {
            currentBolDisplay.textContent = beatInfo.bol;
        }
    }

    /**
     * Clear all highlights
     */
    function clearHighlight() {
        if (!container) return;

        const allBeats = container.querySelectorAll('.taal-beat');
        allBeats.forEach(beat => beat.classList.remove('active'));
    }

    /**
     * Check if playing
     * @returns {boolean}
     */
    function isActive() {
        return isPlaying;
    }

    /**
     * Get current taal
     * @returns {Object|null}
     */
    function getCurrentTaal() {
        return currentTaal;
    }

    // Public API
    return {
        init,
        loadTaal,
        start,
        stop,
        highlightBeat,
        clearHighlight,
        isActive,
        getCurrentTaal
    };
})();

// Make available globally
window.TaalDisplay = TaalDisplay;
