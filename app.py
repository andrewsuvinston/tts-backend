import asyncio
import edge_tts
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["*"])

# Available English voices
VOICES = {
    "en-US-EmmaMultilingualNeural": "Emma (US, Female)",
    "en-US-GuyNeural": "Guy (US, Male)",
    "en-US-JennyNeural": "Jenny (US, Female)",
    "en-GB-SoniaNeural": "Sonia (UK, Female)",
    "en-GB-RyanNeural": "Ryan (UK, Male)"
}

@app.route('/')
def home():
    return "TTS Backend is running!"

@app.route('/voices', methods=['GET'])
def list_voices():
    return jsonify(VOICES)

@app.route('/tts', methods=['POST'])
def generate_tts():
    data = request.json
    text = data.get('text', '')
    voice = data.get('voice', 'en-US-EmmaMultilingualNeural')
    rate = data.get('rate', '+0%')
    pitch = data.get('pitch', '+0Hz')

    if not text:
        return jsonify({"error": "No text provided"}), 400

    async def _generate():
        output_file = "output.mp3"
        communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
        await communicate.save(output_file)
        return output_file

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    output_file = loop.run_until_complete(_generate())

    return send_file(
        output_file,
        mimetype='audio/mpeg',
        as_attachment=True,
        download_name='speech.mp3'
    )

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)