import requests
import base64
import json
from pathlib import Path

# Test the FastAPI endpoints
BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test the health check endpoint"""
    response = requests.get(f"{BASE_URL}/")
    print("Health Check:", response.json())

def test_model_info():
    """Test the model info endpoint"""
    response = requests.get(f"{BASE_URL}/model/info")
    print("Model Info:", response.json())

def test_feature_extraction(image_path):
    """Test feature extraction from image"""
    if not Path(image_path).exists():
        print(f"Image file {image_path} not found")
        return None
    
    with open(image_path, "rb") as f:
        files = {"image": f}
        response = requests.post(f"{BASE_URL}/extract_features", files=files)
    
    if response.status_code == 200:
        features = response.json()
        print("Extracted Features:", features)
        return features
    else:
        print("Feature extraction failed:", response.text)
        return None

def test_prediction_form(image_path, features=None):
    """Test prediction using form data"""
    if not Path(image_path).exists():
        print(f"Image file {image_path} not found")
        return
    
    # Use provided features or default values
    if features is None:
        features = {
            "R": 100.0,
            "G": 150.0,
            "B": 120.0,
            "brightness": 123.33,
            "rgb_sum": 370.0,
            "normalized_brightness": -0.073
        }
    
    with open(image_path, "rb") as f:
        files = {"image": f}
        data = {
            "R": features["R"],
            "G": features["G"],
            "B": features["B"],
            "brightness": features.get("brightness"),
            "rgb_sum": features.get("rgb_sum"),
            "normalized_brightness": features.get("normalized_brightness")
        }
        response = requests.post(f"{BASE_URL}/predict", files=files, data=data)
    
    if response.status_code == 200:
        result = response.json()
        print("Prediction Result:", result)
    else:
        print("Prediction failed:", response.text)

def test_prediction_json(image_path, features=None):
    """Test prediction using JSON with base64 image"""
    if not Path(image_path).exists():
        print(f"Image file {image_path} not found")
        return
    
    # Convert image to base64
    with open(image_path, "rb") as f:
        image_base64 = base64.b64encode(f.read()).decode('utf-8')
    
    # Use provided features or default values
    if features is None:
        features = {
            "R": 100.0,
            "G": 150.0,
            "B": 120.0,
            "brightness": 123.33,
            "rgb_sum": 370.0,
            "normalized_brightness": -0.073
        }
    
    request_data = {
        "features": features,
        "image_base64": image_base64
    }
    
    response = requests.post(
        f"{BASE_URL}/predict_json",
        json=request_data,
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code == 200:
        result = response.json()
        print("JSON Prediction Result:", result)
    else:
        print("JSON Prediction failed:", response.text)

if __name__ == "__main__":
    # Example usage
    print("Testing FastAPI Urine Analysis API...")
    
    # Test basic endpoints
    try:
        test_health_check()
        test_model_info()
    except requests.ConnectionError:
        print("API server is not running. Start it with: uvicorn main:app --reload")
        exit(1)
    
    # Test with sample image (replace with actual image path)
    sample_image = "images/071.jpg"  # Replace with actual image path
    
    if Path(sample_image).exists():
        # Extract features from image
        features = test_feature_extraction(sample_image)
        
        # Test prediction endpoints
        test_prediction_form(sample_image, features)
        test_prediction_json(sample_image, features)
    else:
        print(f"Sample image '{sample_image}' not found. Using default features for testing.")
        # Test with default features only (no image)
        default_features = {
            "R": 100.0,
            "G": 150.0,
            "B": 120.0
        }
        
        request_data = {
            "features": default_features,
            "image_base64": None
        }
        
        try:
            response = requests.post(
                f"{BASE_URL}/predict_json",
                json=request_data,
                headers={"Content-Type": "application/json"}
            )
            print("Test Prediction (no image):", response.json())
        except Exception as e:
            print(f"Test failed: {e}")
