from flask import Flask, request, jsonify, send_file, after_this_request
from flask_cors import CORS
import os
import uuid
import asyncio
from services.pdf_extractor import extract_text_from_pdf
from services.tts_engine import text_to_speech

app = Flask(__name__)
CORS(app)

basedir = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(basedir, 'uploads')
OUTPUT_FOLDER = os.path.join(basedir, 'outputs')

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

@app.route('/api/convert', methods=['POST'])
def convert_pdf():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file:
        try:
            # Save PDF
            filename = str(uuid.uuid4()) + ".pdf"
            pdf_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(pdf_path)

            # Extract Text
            text = extract_text_from_pdf(pdf_path)
            if not text.strip():
                return jsonify({'error': 'No text found in PDF'}), 400

            # Convert to Audio
            mp3_filename = os.path.splitext(filename)[0] + ".mp3"
            mp3_path = os.path.join(OUTPUT_FOLDER, mp3_filename)
            
            # Run async TTS in sync context
            asyncio.run(text_to_speech(text, mp3_path))

            # Cleanup PDF
            os.remove(pdf_path)

            return jsonify({
                'message': 'Conversion successful',
                'download_url': f'/api/download/{mp3_filename}'
            })

        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/api/files/<filename>')
def serve_pdf(filename):
    return send_file(os.path.join(UPLOAD_FOLDER, filename))

@app.route('/api/voices', methods=['GET'])
def get_voices():
    from services.tts_engine import get_available_voices
    return jsonify(get_available_voices())

@app.route('/api/speak', methods=['POST'])
def speak_text():
    data = request.json
    text = data.get('text', '')
    voice = data.get('voice', 'es-ES-AlvaroNeural')
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400

    try:
        # Generate a smaller temporary file for this snippet
        snippet_id = str(uuid.uuid4())
        mp3_filename = f"snippet_{snippet_id}.mp3"
        mp3_path = os.path.join(OUTPUT_FOLDER, mp3_filename)
        
        asyncio.run(text_to_speech(text, mp3_path, voice))
        
        return jsonify({
            'download_url': f'/api/download/{mp3_filename}'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/download/<filename>', methods=['GET'])
def download_file(filename):
    file_path = os.path.join(OUTPUT_FOLDER, filename)
    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=True)
    else:
        return jsonify({'error': 'File not found'}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5001)
