/**
 * Main Application Controller
 * Initializes and coordinates all modules
 */

(function () {
    'use strict';

    // Application state
    const AppState = {
        currentTab: 'pitch',
        targetSwara: 'Sa',
        isListening: false,
        isRecording: false,
        currentRaga: null,
        tempo: 80,
        currentScale: 'C#'
    };

    /**
     * Initialize the application
     */
    function init() {
        // Set initial scale
        SwaraModule.setScale(AppState.currentScale);

        // Check browser support
        const support = Helpers.checkBrowserSupport();
        if (!support.allSupported()) {
            Helpers.showToast('Your browser may not support all features', 'error');
        }

        // Initialize modules
        initNavigation();
        initPitchSection();
        initHarmoniumSection();
        initRagaSection();
        initTaalSection();
        initOrnamentSection();

        // Initialize audio context on first interaction
        document.addEventListener('click', initAudioContext, { once: true });
        document.addEventListener('keydown', initAudioContext, { once: true });

        console.log('🎵 Sargam Shiksha initialized');
    }

    /**
     * Initialize audio context
     */
    function initAudioContext() {
        OscillatorModule.init();
        OscillatorModule.resume();
    }

    /**
     * Initialize navigation tabs
     */
    function initNavigation() {
        const tabs = document.querySelectorAll('.nav-tab');
        const sections = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;

                // Update active states
                tabs.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');

                // Show target section
                sections.forEach(section => {
                    section.classList.remove('active');
                });
                document.getElementById(`${targetTab}-section`).classList.add('active');

                // Stop any playing audio when switching tabs
                stopAllAudio();

                AppState.currentTab = targetTab;
            });
        });
    }

    /**
     * Stop all audio activities
     */
    function stopAllAudio() {
        if (AppState.isListening) {
            PitchDetector.stopListening();
            WaveformVisualizer.stop();
            AppState.isListening = false;
            updatePitchButton(false);
        }

        if (AppState.isRecording) {
            AudioRecorder.stopRecording();
            AppState.isRecording = false;
        }

        OscillatorModule.stopAll();
        TaalDisplay.stop();
    }

    /**
     * Initialize pitch practice section
     */
    function initPitchSection() {
        // Initialize waveform
        const waveformCanvas = document.getElementById('waveform-canvas');
        WaveformVisualizer.init(waveformCanvas);
        WaveformVisualizer.start();

        // Initialize pitch meter
        PitchMeter.init({});

        // Scale selector
        const pitchScaleSelect = document.getElementById('pitch-scale-select');
        pitchScaleSelect.value = AppState.currentScale;
        pitchScaleSelect.addEventListener('change', () => {
            updateGlobalScale(pitchScaleSelect.value);
        });

        // Swara selector buttons
        const swaraButtons = document.querySelectorAll('#target-swara-selector .swara-btn');
        swaraButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                swaraButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                AppState.targetSwara = btn.dataset.swara;
            });
        });

        // Start/Stop pitch detection button
        const startPitchBtn = document.getElementById('start-pitch-btn');
        startPitchBtn.addEventListener('click', togglePitchDetection);

        // Play reference button
        const playRefBtn = document.getElementById('play-reference-btn');
        playRefBtn.addEventListener('click', () => {
            const ctrl = OscillatorModule.playSwara(AppState.targetSwara, { volume: 0.4 });
            setTimeout(() => ctrl && ctrl.stop(), 2000);
        });

        // Record button
        const recordBtn = document.getElementById('record-btn');
        recordBtn.addEventListener('click', toggleRecording);

        // Stop recording button
        const stopRecordBtn = document.getElementById('stop-record-btn');
        stopRecordBtn.addEventListener('click', stopRecording);

        // Download button
        const downloadBtn = document.getElementById('download-recording-btn');
        downloadBtn.addEventListener('click', () => {
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            AudioRecorder.downloadAsWav(`sargam-practice-${timestamp}`);
        });

        // Microphone permission modal
        const micModal = document.getElementById('mic-permission-modal');
        const grantMicBtn = document.getElementById('grant-mic-permission');
        grantMicBtn.addEventListener('click', async () => {
            micModal.classList.add('hidden');
            await startPitchDetection();
        });
    }

    /**
     * Update global scale state and sync across sections
     */
    function updateGlobalScale(scaleName) {
        if (scaleName === 'Manual') return;

        AppState.currentScale = scaleName;
        SwaraModule.setScale(scaleName);

        // Sync selectors
        document.getElementById('pitch-scale-select').value = scaleName;
        document.getElementById('harmonium-scale-select').value = scaleName;

        // Sync harmonium slider
        const freq = Math.round(SwaraModule.getBaseFrequency());
        const slider = document.getElementById('base-frequency');
        const value = document.getElementById('base-frequency-value');
        if (slider && value) {
            slider.value = freq;
            value.textContent = `${freq} Hz`;
        }
    }

    /**
     * Toggle pitch detection
     */
    async function togglePitchDetection() {
        if (AppState.isListening) {
            stopPitchDetection();
        } else {
            // Check permission first
            const permission = await PitchDetector.checkPermission();
            if (permission === 'denied') {
                Helpers.showToast('Microphone access denied. Please enable in browser settings.', 'error');
                return;
            }

            if (permission === 'prompt') {
                document.getElementById('mic-permission-modal').classList.remove('hidden');
                return;
            }

            await startPitchDetection();
        }
    }

    /**
     * Start pitch detection
     */
    async function startPitchDetection() {
        const success = await PitchDetector.startListening((pitchData) => {
            // Update waveform
            if (pitchData.waveformData) {
                WaveformVisualizer.updateData(pitchData.waveformData);
            }

            // Update pitch meter
            PitchMeter.update(pitchData, AppState.targetSwara);

            // Update waveform color
            if (pitchData.frequency) {
                const accuracy = SwaraModule.getAccuracy(pitchData.frequency, AppState.targetSwara);
                WaveformVisualizer.setAccuracyColor(accuracy.status);
            } else {
                WaveformVisualizer.setAccuracyColor('default');
            }
        });

        if (success) {
            AppState.isListening = true;
            updatePitchButton(true);
        } else {
            Helpers.showToast('Could not access microphone', 'error');
        }
    }

    /**
     * Stop pitch detection
     */
    function stopPitchDetection() {
        PitchDetector.stopListening();
        WaveformVisualizer.setAccuracyColor('default');
        PitchMeter.setStopped();
        AppState.isListening = false;
        updatePitchButton(false);
    }

    /**
     * Update pitch button state
     */
    function updatePitchButton(isListening) {
        const btn = document.getElementById('start-pitch-btn');
        if (isListening) {
            btn.innerHTML = '<span class="btn-icon">⏹️</span> Stop Listening';
            btn.classList.add('btn-danger');
            btn.classList.remove('btn-primary');
        } else {
            btn.innerHTML = '<span class="btn-icon">🎙️</span> Start Listening';
            btn.classList.remove('btn-danger');
            btn.classList.add('btn-primary');
        }
    }

    /**
     * Toggle recording
     */
    async function toggleRecording() {
        if (AppState.isRecording) {
            await stopRecording();
        } else {
            await startRecording();
        }
    }

    /**
     * Start recording
     */
    async function startRecording() {
        const recordingSection = document.getElementById('recording-section');
        const recordingTime = document.getElementById('recording-time');
        const recordBtn = document.getElementById('record-btn');
        const playbackSection = document.getElementById('playback-section');

        playbackSection.classList.add('hidden');

        const success = await AudioRecorder.startRecording((elapsed) => {
            recordingTime.textContent = AudioRecorder.formatTime(elapsed);
        });

        if (success) {
            AppState.isRecording = true;
            recordingSection.classList.remove('hidden');
            recordBtn.innerHTML = '<span class="btn-icon">⏹️</span> Stop';
            recordBtn.classList.add('btn-danger');
        } else {
            Helpers.showToast('Could not start recording', 'error');
        }
    }

    /**
     * Stop recording
     */
    async function stopRecording() {
        const recordingSection = document.getElementById('recording-section');
        const playbackSection = document.getElementById('playback-section');
        const playbackAudio = document.getElementById('playback-audio');
        const recordBtn = document.getElementById('record-btn');

        const blob = await AudioRecorder.stopRecording();
        AppState.isRecording = false;
        recordingSection.classList.add('hidden');

        if (blob) {
            const url = AudioRecorder.getPlaybackUrl();
            playbackAudio.src = url;
            playbackSection.classList.remove('hidden');
        }

        recordBtn.innerHTML = '<span class="btn-icon">⏺️</span> Record';
        recordBtn.classList.remove('btn-danger');
    }

    /**
     * Initialize harmonium section
     */
    function initHarmoniumSection() {
        HarmoniumKeyboard.init('harmonium-keyboard');

        // Scale selector
        const harmoniumScaleSelect = document.getElementById('harmonium-scale-select');
        harmoniumScaleSelect.value = AppState.currentScale;
        harmoniumScaleSelect.addEventListener('change', () => {
            updateGlobalScale(harmoniumScaleSelect.value);
        });

        // Base frequency slider
        const baseFreqSlider = document.getElementById('base-frequency');
        const baseFreqValue = document.getElementById('base-frequency-value');

        // Set initial frequency based on scale
        const initialFreq = Math.round(SwaraModule.getBaseFrequency());
        baseFreqSlider.value = initialFreq;
        baseFreqValue.textContent = `${initialFreq} Hz`;

        baseFreqSlider.addEventListener('input', () => {
            const freq = parseInt(baseFreqSlider.value);
            baseFreqValue.textContent = `${freq} Hz`;
            SwaraModule.setBaseFrequency(freq);
            
            // Sync with scale select
            harmoniumScaleSelect.value = 'Manual';
            document.getElementById('pitch-scale-select').value = 'Manual';
            AppState.currentScale = 'Manual';
        });

        // Octave selector
        const octaveSelect = document.getElementById('octave-select');
        octaveSelect.addEventListener('change', () => {
            // Could implement octave shifting here
            const octave = octaveSelect.value;
            console.log('Octave selected:', octave);
        });
    }

    /**
     * Initialize raga section
     */
    function initRagaSection() {
        const ragaList = document.getElementById('raga-list');
        const ragaDetail = document.getElementById('raga-detail');
        const backBtn = document.getElementById('back-to-ragas');

        // Populate raga list
        const ragas = RagaModule.getAllRagas();
        Object.entries(ragas).forEach(([key, raga]) => {
            const card = document.createElement('div');
            card.className = 'raga-card';
            card.innerHTML = `
                <h3>${raga.name} (${raga.nameHindi})</h3>
                <p class="raga-thaat">Thaat: ${raga.thaat}</p>
                <p class="raga-time">${raga.timeIcon} ${raga.time}</p>
            `;
            card.addEventListener('click', () => showRagaDetail(key));
            ragaList.appendChild(card);
        });

        // Back button
        backBtn.addEventListener('click', () => {
            ragaDetail.classList.add('hidden');
            ragaList.classList.remove('hidden');
        });

        // Play pattern buttons
        document.querySelectorAll('.play-pattern-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const pattern = btn.dataset.pattern;
                const raga = RagaModule.getRaga(AppState.currentRaga);
                if (raga) {
                    const swaras = pattern === 'aaroh' ? raga.aaroh : raga.avroh;
                    await OscillatorModule.playSequence(swaras, 400);
                }
            });
        });
    }

    /**
     * Show raga detail view
     */
    function showRagaDetail(ragaKey) {
        const raga = RagaModule.getRaga(ragaKey);
        if (!raga) return;

        AppState.currentRaga = ragaKey;

        document.getElementById('raga-list').classList.add('hidden');
        const detail = document.getElementById('raga-detail');
        detail.classList.remove('hidden');

        document.getElementById('raga-name').textContent = `${raga.name} (${raga.nameHindi})`;
        document.getElementById('raga-thaat').textContent = raga.thaat;
        document.getElementById('raga-time').textContent = raga.time;
        document.getElementById('raga-mood').textContent = raga.mood;
        document.getElementById('raga-vadi').textContent = raga.vadi;
        document.getElementById('raga-samvadi').textContent = raga.samvadi;
        document.getElementById('raga-aaroh').textContent = raga.aaroh.map(s =>
            SwaraModule.SHORT_NAMES[s] || s
        ).join(' ');
        document.getElementById('raga-avroh').textContent = raga.avroh.map(s =>
            SwaraModule.SHORT_NAMES[s] || s
        ).join(' ');

        // Update swara grid
        const swaraGrid = document.getElementById('swara-grid');
        swaraGrid.innerHTML = '';

        SwaraModule.getAllSwaras().forEach(swara => {
            const indicator = document.createElement('div');
            indicator.className = 'swara-indicator';
            indicator.textContent = SwaraModule.SHORT_NAMES[swara];

            const isInRaga = raga.swaras.includes(swara);
            indicator.classList.add(isInRaga ? 'active' : 'inactive');

            // Set color
            const colors = {
                'Sa': '#ff5722', 'Re': '#ff9800', 'Re_komal': '#ff9800',
                'Ga': '#ffc107', 'Ga_komal': '#ffc107',
                'Ma': '#8bc34a', 'Ma_tivra': '#8bc34a',
                'Pa': '#00bcd4',
                'Dha': '#3f51b5', 'Dha_komal': '#3f51b5',
                'Ni': '#9c27b0', 'Ni_komal': '#9c27b0'
            };
            indicator.style.background = colors[swara] || '#666';

            swaraGrid.appendChild(indicator);
        });
    }

    /**
     * Initialize taal section
     */
    function initTaalSection() {
        TaalDisplay.init('taal-display');

        // Load default taal
        TaalDisplay.loadTaal('teentaal');

        // Taal selector
        const taalSelect = document.getElementById('taal-select');
        taalSelect.addEventListener('change', () => {
            TaalDisplay.stop();
            TaalDisplay.loadTaal(taalSelect.value);
            updateTaalButton(false);
        });

        // Tempo slider
        const tempoSlider = document.getElementById('tempo-slider');
        const tempoValue = document.getElementById('tempo-value');

        tempoSlider.addEventListener('input', () => {
            AppState.tempo = parseInt(tempoSlider.value);
            tempoValue.textContent = `${AppState.tempo} BPM`;

            // Restart if playing
            if (TaalDisplay.isActive()) {
                TaalDisplay.stop();
                TaalDisplay.start(AppState.tempo);
            }
        });

        // Start/Stop button
        const startTaalBtn = document.getElementById('start-taal-btn');
        startTaalBtn.addEventListener('click', () => {
            if (TaalDisplay.isActive()) {
                TaalDisplay.stop();
                updateTaalButton(false);
            } else {
                TaalDisplay.start(AppState.tempo);
                updateTaalButton(true);
            }
        });
    }

    /**
     * Update taal button state
     */
    function updateTaalButton(isPlaying) {
        const btn = document.getElementById('start-taal-btn');
        if (isPlaying) {
            btn.innerHTML = '<span class="btn-icon">⏹️</span> Stop';
            btn.classList.add('btn-danger');
            btn.classList.remove('btn-primary');
        } else {
            btn.innerHTML = '<span class="btn-icon">▶️</span> Start';
            btn.classList.remove('btn-danger');
            btn.classList.add('btn-primary');
        }
    }

    /**
     * Initialize ornament section
     */
    function initOrnamentSection() {
        // Draw ornament visualizations
        drawOrnamentVisuals();

        // Play ornament buttons
        document.querySelectorAll('.play-ornament-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const ornament = btn.dataset.ornament;
                playOrnamentDemo(ornament);
            });
        });
    }

    /**
     * Draw ornament visualizations
     */
    function drawOrnamentVisuals() {
        // Meend visualization
        const meendCanvas = document.getElementById('meend-canvas');
        if (meendCanvas) {
            const ctx = meendCanvas.getContext('2d');
            ctx.strokeStyle = '#ff9800';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(20, 80);
            ctx.quadraticCurveTo(150, 80, 280, 20);
            ctx.stroke();
        }

        // Khatka visualization
        const khatkaCanvas = document.getElementById('khatka-canvas');
        if (khatkaCanvas) {
            const ctx = khatkaCanvas.getContext('2d');
            ctx.strokeStyle = '#4caf50';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(20, 50);
            ctx.lineTo(100, 50);
            ctx.lineTo(110, 30);
            ctx.lineTo(120, 50);
            ctx.lineTo(280, 50);
            ctx.stroke();
        }

        // Murki visualization
        const murkiCanvas = document.getElementById('murki-canvas');
        if (murkiCanvas) {
            const ctx = murkiCanvas.getContext('2d');
            ctx.strokeStyle = '#2196f3';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(20, 50);
            const points = [50, 30, 70, 50, 90, 25, 110, 50, 130, 35, 150, 50];
            for (let i = 0; i < points.length; i += 2) {
                ctx.lineTo(points[i] + 50, points[i + 1]);
            }
            ctx.lineTo(280, 50);
            ctx.stroke();
        }

        // Andolan visualization  
        const andolanCanvas = document.getElementById('andolan-canvas');
        if (andolanCanvas) {
            const ctx = andolanCanvas.getContext('2d');
            ctx.strokeStyle = '#9c27b0';
            ctx.lineWidth = 3;
            ctx.beginPath();
            for (let x = 0; x < 300; x++) {
                const y = 50 + Math.sin(x * 0.1) * 15;
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
        }
    }

    /**
     * Play ornament demonstration
     */
    async function playOrnamentDemo(ornament) {
        switch (ornament) {
            case 'meend':
                await OscillatorModule.playMeend('Sa', 'Ga', 2000);
                break;
            case 'khatka':
                OscillatorModule.playSwara('Ga');
                setTimeout(() => OscillatorModule.stopAll(), 200);
                setTimeout(() => {
                    OscillatorModule.playSwara('Re');
                    setTimeout(() => OscillatorModule.stopAll(), 100);
                    setTimeout(() => {
                        OscillatorModule.playSwara('Ga');
                        setTimeout(() => OscillatorModule.stopAll(), 500);
                    }, 100);
                }, 200);
                break;
            case 'murki':
                const murkiNotes = ['Ga', 'Ma', 'Pa', 'Ma', 'Ga'];
                for (const note of murkiNotes) {
                    OscillatorModule.playSwara(note);
                    await Helpers.wait(100);
                    OscillatorModule.stopAll();
                }
                break;
            case 'andolan':
                const andolanPattern = OrnamentModule.generateAndolanPattern(
                    SwaraModule.getFrequency('Dha_komal'), 25, 2000, 3
                );
                const osc = OscillatorModule.playTone(andolanPattern[0].freq, 'andolan');
                for (const point of andolanPattern) {
                    osc.setFrequency(point.freq);
                    await Helpers.wait(20);
                }
                osc.stop();
                break;
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
