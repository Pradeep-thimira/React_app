from flask import Flask, request, jsonify
from flask_cors import CORS
from analytics import run_analysis_pipeline
import json
import os
import tempfile

app = Flask(__name__)
CORS(app)

@app.route('/api/analyze', methods=['POST'])
def analyze():
    # Check if file is present
    if 'file' not in request.files:
        return jsonify({'status': 'error', 'message': 'No file part'}), 400
    
    file = request.files['file']
    metric = request.form.get('metric', 'betweenness')

    if file.filename == '':
        return jsonify({'status': 'error', 'message': 'No selected file'}), 400

    print(f"Received request: {file.filename} -> {metric}")

    temp_path = None
    try:
        # Save uploaded file temporarily
        fd, temp_path = tempfile.mkstemp(suffix='.zip')
        os.close(fd)
        file.save(temp_path)

        # Run the analysis logic
        geojson_str = run_analysis_pipeline(temp_path, metric)
        
        geojson_data = json.loads(geojson_str)
        
        return jsonify({
            'status': 'success',
            'data': geojson_data
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500
    finally:
        # Cleanup
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == '__main__':
    app.run(debug=True, port=5000)