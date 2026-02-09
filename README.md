# Sargam Shiksha - Indian Classical Music Learning App

🎵 **Learn Indian Classical Music** - Pitch Detection, Ragas, Harmonium Practice, Taal (Rhythm)

[![GitHub Pages](https://img.shields.io/badge/Deployed%20on-GitHub%20Pages-blue)](https://sahajananddigital.github.io/music-learning/)

## Features

### 🎤 Pitch Practice
- Real-time pitch detection using your microphone
- Visual waveform display with color-coded accuracy feedback
- Practice any of the 7 swaras (Sa, Re, Ga, Ma, Pa, Dha, Ni)
- Reference tone playback
- Audio recording with WAV download

### 🎹 Harmonium Keyboard
- Interactive 2-octave harmonium
- Play with mouse clicks or keyboard (A-L keys)
- Adjustable base frequency (Sa = 200-300 Hz)
- All komal (flat) and tivra (sharp) notes included

### 🎶 Raga Explorer
- 10+ popular ragas with detailed information
- Aaroh (ascending) and Avroh (descending) patterns
- Thaat, time of day, mood, and vadi/samvadi notes
- Interactive playback of raga patterns

### 🥁 Taal Practice
- 7 different taals: Teentaal, Ektaal, Jhaptaal, Dadra, Keherwa, Roopak, Chautaal
- Visual beat display with bols
- Sam and Khali markers
- Adjustable tempo (40-200 BPM)

### ✨ Ornaments (Alankar)
- Learn meend, khatka, murki, and andolan
- Visual representation of each ornament
- Audio demonstrations

## Quick Start

1. Clone or download this repository
2. Open `index.html` in a modern browser (Chrome or Firefox recommended)
3. Allow microphone access when prompted for pitch detection

Or deploy to GitHub Pages for online access.

## GitHub Pages Deployment

1. Go to your repository settings
2. Navigate to Pages section
3. Select "Deploy from a branch"
4. Choose `main` branch and `/ (root)` folder
5. Your app will be live at `https://username.github.io/music-learning/`

## Technology Stack

- **Audio**: Howler.js + Web Audio API
- **Pitch Detection**: Autocorrelation algorithm
- **Recording**: MediaRecorder API
- **UI**: Vanilla JavaScript, CSS3 with animations
- **Deployment**: Static files, GitHub Pages ready

## Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Edge
- ⚠️ Safari (limited Web Audio support)

## Project Structure

```
music-learning/
├── index.html              # Main entry point
├── css/
│   └── styles.css          # Dark theme styling
├── js/
│   ├── app.js              # Main controller
│   ├── audio/              # Audio modules
│   │   ├── oscillator.js   # Tone generation
│   │   ├── pitchDetector.js
│   │   └── audioRecorder.js
│   ├── music/              # Music theory
│   │   ├── swaras.js       # Note definitions
│   │   ├── ragas.js        # Raga database
│   │   ├── taals.js        # Rhythm patterns
│   │   └── ornaments.js    # Alankar definitions
│   ├── ui/                 # UI components
│   │   ├── waveformVisualizer.js
│   │   ├── harmoniumKeyboard.js
│   │   ├── pitchMeter.js
│   │   └── taalDisplay.js
│   └── utils/              # Utilities
│       ├── helpers.js
│       └── security.js
└── tests/                  # Test files
    └── swaras.test.html
```

## Indian Music Concepts

### Swaras (Notes)
| Swara | Hindi | Frequency (Sa=240Hz) |
|-------|-------|---------------------|
| Sa    | षड्ज  | 240 Hz              |
| Re    | ऋषभ   | 270 Hz              |
| Ga    | गांधार | 300 Hz              |
| Ma    | मध्यम  | 320 Hz              |
| Pa    | पंचम   | 360 Hz              |
| Dha   | धैवत   | 405 Hz              |
| Ni    | निषाद  | 450 Hz              |

### Included Ragas
- Yaman, Bhairavi, Bhairav, Bilawal, Kafi
- Durga, Todi, Marwa, Malkauns, Desh

## Security

- Content Security Policy (CSP) headers
- Input sanitization
- No external data transmission
- All audio processing is client-side

## License

This project is open source. Feel free to use, modify, and distribute.

---

**🎵 सरगम शिक्षा** - *Learn music, enrich your soul*
