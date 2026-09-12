// Backend URL — while testing locally, this is your Flask server
const BACKEND_URL = 'http://127.0.0.1:5000';

const textInput = document.getElementById('textInput');
const voiceSelect = document.getElementById('voiceSelect');
const rateRange = document.getElementById('rateRange');
const rateValue = document.getElementById('rateValue');
const pitchRange = document.getElementById('pitchRange');
const pitchValue = document.getElementById('pitchValue');
const generateBtn = document.getElementById('generateBtn');
const audioPlayer = document.getElementById('audioPlayer');
const statusEl = document.getElementById('status');

function setStatus(msg, type = '') {
    statusEl.textContent = msg;
    statusEl.className = 'status ' + type;
}

// Load voices from backend on page load
async function loadVoices() {
    try {
        const res = await fetch(`${BACKEND_URL}/voices`);
        if (!res.ok) throw new Error('Failed to fetch voices');
        const voices = await res.json();
        voiceSelect.innerHTML = '';
        for (const [id, name] of Object.entries(voices)) {
            const opt = document.createElement('option');
            opt.value = id;
            opt.textContent = name;
            voiceSelect.appendChild(opt);
        }
        setStatus('Ready. Type something and click Generate.');
    } catch (err) {
        console.error(err);
        setStatus('⚠️ Backend not reachable. Is app.py running?', 'error');
    }
}

// Slider labels
rateRange.addEventListener('input', () => { rateValue.textContent = parseFloat(rateRange.value).toFixed(1); });
pitchRange.addEventListener('input', () => { pitchValue.textContent = pitchRange.value; });

// Generate button
generateBtn.addEventListener('click', async () => {
    const text = textInput.value.trim();
    if (!text) {
        setStatus('Please enter some text.', 'error');
        return;
    }

    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';
    setStatus('Generating audio, please wait...');

    // Convert UI values into the format edge-tts expects
    const ratePercent = Math.round((parseFloat(rateRange.value) - 1) * 100);
    const pitchHz = parseInt(pitchRange.value, 10);

    const payload = {
        text: text,
        voice: voiceSelect.value,
        rate: `${ratePercent >= 0 ? '+' : ''}${ratePercent}%`,
        pitch: `${pitchHz >= 0 ? '+' : ''}${pitchHz}Hz`
    };

    try {
        const res = await fetch(`${BACKEND_URL}/tts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'TTS generation failed');
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        audioPlayer.src = url;
        audioPlayer.style.display = 'block';
        audioPlayer.play();
        setStatus('✅ Done! Audio ready.', 'success');
    } catch (err) {
        console.error(err);
        setStatus('❌ ' + err.message, 'error');
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate Speech';
    }
});

loadVoices();