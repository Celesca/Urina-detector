# Urine Analysis FastAPI Backend

This FastAPI application provides endpoints for predicting urine specific gravity using a hybrid deep learning model that combines image analysis and tabular features.

## Setup

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Copy Model Files**
   Make sure you have trained model files (`.pth`) in the `models/` directory. The API will look for:
   - `models/50_epochs_front.pth` (primary)
   - `models/25_epochs.pth`
   - `models/40_epochs.pth` 
   - `models/45_epochs.pth`

   Or run the setup script:
   ```bash
   setup.bat
   ```

3. **Start the Server**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## API Endpoints

### Health Check
- **GET** `/` - Check if the API is running
- **GET** `/model/info` - Get model information

### Feature Extraction
- **POST** `/extract_features` - Extract RGB and brightness features from an uploaded image
  - **Input**: Image file (multipart/form-data)
  - **Output**: JSON with extracted features (R, G, B, brightness, rgb_sum, normalized_brightness)

### Prediction Endpoints

#### 1. Form Data Prediction
- **POST** `/predict` - Predict specific gravity using form data
  - **Input**: 
    - `image`: Image file (required)
    - `R`: Red channel value (required)
    - `G`: Green channel value (required)
    - `B`: Blue channel value (required)
    - `brightness`: Optional, calculated if not provided
    - `rgb_sum`: Optional, calculated if not provided
    - `normalized_brightness`: Optional, calculated if not provided
  - **Output**: JSON with prediction result

#### 2. JSON Prediction
- **POST** `/predict_json` - Predict specific gravity using JSON data
  - **Input**: JSON object with:
    ```json
    {
      "features": {
        "R": 100.0,
        "G": 150.0,
        "B": 120.0,
        "brightness": 123.33,
        "rgb_sum": 370.0,
        "normalized_brightness": -0.073
      },
      "image_base64": "base64_encoded_image_string"
    }
    ```
  - **Output**: JSON with prediction result

## Model Architecture

The hybrid model combines:
- **Image Processing**: ResNet-18 feature extractor (pretrained)
- **Tabular Processing**: Multi-layer perceptron for numerical features
- **Final Prediction**: Regression layer combining both feature types

### Input Features
1. **R**: Red channel average
2. **G**: Green channel average  
3. **B**: Blue channel average
4. **brightness**: Overall image brightness
5. **rgb_sum**: Sum of R+G+B values
6. **normalized_brightness**: Z-score normalized brightness

### Output
- **predicted_sp_refractometer**: Specific gravity prediction

## Usage Examples

### Python Client Example
```python
import requests
import base64

# Health check
response = requests.get("http://localhost:8000/")
print(response.json())

# Extract features from image
with open("urine_image.jpg", "rb") as f:
    files = {"image": f}
    response = requests.post("http://localhost:8000/extract_features", files=files)
    features = response.json()

# Make prediction
with open("urine_image.jpg", "rb") as f:
    files = {"image": f}
    data = {
        "R": features["R"],
        "G": features["G"], 
        "B": features["B"]
    }
    response = requests.post("http://localhost:8000/predict", files=files, data=data)
    prediction = response.json()
    print(f"Predicted Sp.Refractometer: {prediction['predicted_sp_refractometer']}")
```

### cURL Example
```bash
# Extract features
curl -X POST "http://localhost:8000/extract_features" \
     -H "accept: application/json" \
     -H "Content-Type: multipart/form-data" \
     -F "image=@urine_image.jpg"

# Make prediction
curl -X POST "http://localhost:8000/predict" \
     -H "accept: application/json" \
     -H "Content-Type: multipart/form-data" \
     -F "image=@urine_image.jpg" \
     -F "R=100.0" \
     -F "G=150.0" \
     -F "B=120.0"
```

## Testing

Run the test script to verify all endpoints:
```bash
python test_api.py
```

## API Documentation

Once the server is running, visit:
- **Interactive docs**: http://localhost:8000/docs
- **ReDoc docs**: http://localhost:8000/redoc

## Notes

- The model expects images to be resized to 224x224 pixels
- Images are automatically normalized using ImageNet statistics
- If tabular features are partially provided, missing ones are calculated automatically
- The API handles both RGB and grayscale images (converted to RGB)
- CORS is enabled for all origins (adjust for production)
