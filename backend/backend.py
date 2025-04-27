from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.preprocessing import image
import numpy as np
import keras
import os

app = Flask(__name__)
CORS(app)  # <-- This allows all origins by default

# Load your trained model
model = keras.models.load_model('deepfake_detection_model.keras')

# Image dimensions
img_height, img_width = 128, 128

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # Save the file temporarily
        file_path = os.path.join('/tmp', file.filename)
        file.save(file_path)

        # Process the image
        img = image.load_img(file_path, target_size=(img_height, img_width))
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array /= 255.0  # normalize if needed

        # Predict
        prediction = model.predict(img_array)
        pred_value = prediction[0][0]

        # Delete the temp file
        os.remove(file_path)

        # Decide based on threshold
        result = pred_value < 0.5

        # Return as JSON
        return jsonify({'result': str(result)})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
