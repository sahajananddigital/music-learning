/**
 * Pitch Meter UI
 * Visual indicator for pitch accuracy
 */

const PitchMeter = (function () {
    'use strict';

    let markerElement = null;
    let feedbackText = null;
    let feedbackArrow = null;
    let frequencyDisplay = null;
    let swaraDisplay = null;

    /**
     * Initialize the pitch meter
     * @param {Object} elements - DOM elements
     */
    function init(elements) {
        markerElement = elements.marker || document.getElementById('pitch-marker');
        feedbackText = elements.feedbackText || document.getElementById('feedback-text');
        feedbackArrow = elements.feedbackArrow || document.getElementById('feedback-arrow');
        frequencyDisplay = elements.frequency || document.getElementById('current-frequency');
        swaraDisplay = elements.swara || document.getElementById('current-swara');
    }

    /**
     * Update the pitch meter with new data
     * @param {Object} pitchData - Pitch detection data
     * @param {string} targetSwara - Target swara for comparison
     */
    function update(pitchData, targetSwara) {
        if (!pitchData || !pitchData.frequency) {
            setIdle();
            return;
        }

        const { frequency, swara } = pitchData;

        // Update frequency display
        if (frequencyDisplay) {
            frequencyDisplay.textContent = `${frequency.toFixed(1)} Hz`;
        }

        // Update swara display
        if (swaraDisplay && swara) {
            swaraDisplay.textContent = swara.shortName || '--';
        }

        // Calculate accuracy if target is set
        if (targetSwara) {
            const accuracy = SwaraModule.getAccuracy(frequency, targetSwara);
            updateAccuracyIndicator(accuracy);
        } else if (swara) {
            // Just show detected swara info
            updateWithDetectedSwara(swara);
        }
    }

    /**
     * Update the accuracy indicator
     * @param {Object} accuracy - Accuracy data from SwaraModule
     */
    function updateAccuracyIndicator(accuracy) {
        // Update marker position (0-100%, 50% is center/correct)
        if (markerElement) {
            // Map cents to position (-100 cents = 0%, 0 = 50%, +100 cents = 100%)
            const cents = Helpers.clamp(accuracy.cents, -100, 100);
            const position = 50 + (cents / 2);
            markerElement.style.left = `${position}%`;
        }

        // Update feedback
        if (feedbackText) {
            feedbackText.className = 'feedback-text';

            switch (accuracy.status) {
                case 'correct':
                    feedbackText.textContent = 'Perfect! ✓';
                    feedbackText.classList.add('correct');
                    break;
                case 'high':
                    feedbackText.textContent = 'Too high - sing lower';
                    feedbackText.classList.add('high');
                    break;
                case 'low':
                    feedbackText.textContent = 'Too low - sing higher';
                    feedbackText.classList.add('low');
                    break;
            }
        }

        // Update arrow
        if (feedbackArrow) {
            switch (accuracy.status) {
                case 'correct':
                    feedbackArrow.textContent = '✓';
                    break;
                case 'high':
                    feedbackArrow.textContent = '↓';
                    break;
                case 'low':
                    feedbackArrow.textContent = '↑';
                    break;
            }
        }
    }

    /**
     * Update with detected swara (no target)
     * @param {Object} swara - Swara info
     */
    function updateWithDetectedSwara(swara) {
        if (markerElement) {
            // Center the marker when just detecting
            const cents = Helpers.clamp(swara.cents, -100, 100);
            const position = 50 + (cents / 2);
            markerElement.style.left = `${position}%`;
        }

        if (feedbackText) {
            feedbackText.className = 'feedback-text';
            if (swara.isMatch) {
                feedbackText.textContent = `Singing: ${swara.shortName}`;
                feedbackText.classList.add('correct');
            } else {
                feedbackText.textContent = `Near: ${swara.shortName}`;
            }
        }

        if (feedbackArrow) {
            feedbackArrow.textContent = '♪';
        }
    }

    /**
     * Set idle state
     */
    function setIdle() {
        if (frequencyDisplay) {
            frequencyDisplay.textContent = '-- Hz';
        }
        if (swaraDisplay) {
            swaraDisplay.textContent = '--';
        }
        if (markerElement) {
            markerElement.style.left = '50%';
        }
        if (feedbackText) {
            feedbackText.className = 'feedback-text';
            feedbackText.textContent = 'Listening...';
        }
        if (feedbackArrow) {
            feedbackArrow.textContent = '';
        }
    }

    /**
     * Set stopped state
     */
    function setStopped() {
        if (frequencyDisplay) {
            frequencyDisplay.textContent = '-- Hz';
        }
        if (swaraDisplay) {
            swaraDisplay.textContent = '--';
        }
        if (markerElement) {
            markerElement.style.left = '50%';
        }
        if (feedbackText) {
            feedbackText.className = 'feedback-text';
            feedbackText.textContent = 'Click Start to begin';
        }
        if (feedbackArrow) {
            feedbackArrow.textContent = '';
        }
    }

    // Public API
    return {
        init,
        update,
        setIdle,
        setStopped
    };
})();

// Make available globally
window.PitchMeter = PitchMeter;
