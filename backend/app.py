from flask import Flask, request, jsonify
from flask_cors import CORS
from analytics import run_analysis_pipeline
import json

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for React

@app.route('/api/analyze', methods=['POST'])
def analyze():
    data = request.json
    location = data.get('location', 'Moratuwa, Sri Lanka')
    metric = data.get('metric', 'betweenness')

    print(f"Received request: {location} -> {metric}")

    try:
        # Run the GIS logic
        geojson_str = run_analysis_pipeline(location, metric)
        
        # Convert string back to dict for Flask jsonify
        geojson_data = json.loads(geojson_str)
        
        return jsonify({
            'status': 'success',
            'data': geojson_data
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)