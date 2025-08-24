from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import torch
import torch.nn as nn
import torchvision.models as models
from torchvision import transforms
from PIL import Image
import numpy as np
import cv2
import io
import base64
import os
from pathlib import Path

app = FastAPI(title="Urine Analysis API", description="API for urine specific gravity prediction", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Pydantic models for request/response
class TabularFeatures(BaseModel):
    R: float
    G: float
    B: float
    brightness: Optional[float] = None
    rgb_sum: Optional[float] = None
    normalized_brightness: Optional[float] = None

class PredictionRequest(BaseModel):
    features: TabularFeatures
    image_base64: Optional[str] = None

class PredictionResponse(BaseModel):
    predicted_sp_refractometer: float
    success: bool
    message: str

# Global variables for model and transforms
model = None
data_transforms = None
device = None

# Model Architecture (same as in notebook)
class HybridModel(nn.Module):
    def __init__(self, num_tabular_features):
        super(HybridModel, self).__init__()
        # Load a pre-trained ResNet-18 model
        resnet = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)

        # Remove the final fully connected layer
        self.image_feature_extractor = nn.Sequential(*list(resnet.children())[:-1])

        # Define layers for tabular features
        self.tabular_processor = nn.Sequential(
            nn.Linear(num_tabular_features, 64),
            nn.ReLU(),
            nn.Linear(64, 32),
            nn.ReLU()
        )

        # Define the final regression layer
        # The input size is the sum of image features (512 for ResNet-18) and tabular features (32 after processing)
        self.regressor = nn.Linear(512 + 32, 1)

    def forward(self, image, tabular_data):
        # Process image data
        image_features = self.image_feature_extractor(image)
        image_features = torch.flatten(image_features, 1)  # Flatten the features

        # Process tabular data
        tabular_features = self.tabular_processor(tabular_data)

        # Concatenate features
        combined_features = torch.cat((image_features, tabular_features), dim=1)

        # Predict the target
        output = self.regressor(combined_features)
        return output

def get_image_brightness(image_array):
    """Calculate brightness from image array"""
    if len(image_array.shape) == 3:
        gray_img = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
    else:
        gray_img = image_array
    brightness = np.mean(gray_img)
    return brightness

def process_tabular_features(features: TabularFeatures) -> torch.Tensor:
    """Process and normalize tabular features"""
    # Calculate derived features if not provided
    if features.brightness is None:
        features.brightness = (features.R + features.G + features.B) / 3
    
    if features.rgb_sum is None:
        features.rgb_sum = features.R + features.G + features.B
    
    if features.normalized_brightness is None:
        # Using rough normalization - ideally you'd use training set statistics
        mean_b = 128.0  # Approximate mean brightness
        std_b = 64.0    # Approximate std brightness
        features.normalized_brightness = (features.brightness - mean_b) / std_b
    
    # Create feature tensor
    feature_array = np.array([
        features.R,
        features.G, 
        features.B,
        features.brightness,
        features.rgb_sum,
        features.normalized_brightness
    ], dtype=np.float32)
    
    return torch.tensor(feature_array, dtype=torch.float)

def process_image(image_data) -> torch.Tensor:
    """Process image data for model input"""
    global data_transforms
    
    if isinstance(image_data, str):
        # Handle base64 encoded image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    elif isinstance(image_data, bytes):
        image = Image.open(io.BytesIO(image_data)).convert('RGB')
    else:
        image = image_data
    
    # Apply transforms
    if data_transforms:
        image_tensor = data_transforms(image)
    else:
        # Fallback transforms
        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        image_tensor = transform(image)
    
    return image_tensor

@app.on_event("startup")
async def startup_event():
    """Initialize model and transforms on startup"""
    global model, data_transforms, device
    
    # Set device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    # Initialize transforms
    data_transforms = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    # Initialize model
    num_tabular_features = 6  # R, G, B, brightness, rgb_sum, normalized_brightness
    model = HybridModel(num_tabular_features)
    
    # Load model weights if available
    model_path = Path("models/40_epochs.pth")
    if not model_path.exists():
        # Try alternative paths
        alternative_paths = [
            "50_epochs_front.pth",
            "models/25_epochs.pth", 
            "models/40_epochs.pth",
            "models/45_epochs.pth"
        ]
        for path in alternative_paths:
            if Path(path).exists():
                model_path = Path(path)
                break
    
    if model_path.exists():
        try:
            state_dict = torch.load(model_path, map_location=device, weights_only=True)
            model.load_state_dict(state_dict)
            print(f"Model loaded from {model_path}")
        except Exception as e:
            print(f"Error loading model: {e}")
            print("Using untrained model")
    else:
        print("No model file found. Using untrained model.")
    
    model.to(device)
    model.eval()
    print(f"Model initialized on {device}")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Urine Analysis API is running", "status": "healthy"}

@app.get("/model/info")
async def model_info():
    """Get model information"""
    return {
        "model_type": "HybridModel (ResNet-18 + Tabular)",
        "device": str(device),
        "input_features": ["R", "G", "B", "brightness", "rgb_sum", "normalized_brightness"],
        "output": "Sp.Refractometer prediction"
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict(
    image: UploadFile = File(...),
    R: float = Form(...),
    G: float = Form(...), 
    B: float = Form(...),
    brightness: Optional[float] = Form(None),
    rgb_sum: Optional[float] = Form(None),
    normalized_brightness: Optional[float] = Form(None)
):
    """Predict specific gravity from image and tabular features"""
    try:
        global model, device
        
        if model is None:
            raise HTTPException(status_code=500, detail="Model not initialized")
        
        # Read and process image
        image_data = await image.read()
        image_tensor = process_image(image_data)
        image_tensor = image_tensor.unsqueeze(0).to(device)  # Add batch dimension
        
        # Process tabular features
        features = TabularFeatures(
            R=R, G=G, B=B,
            brightness=brightness,
            rgb_sum=rgb_sum,
            normalized_brightness=normalized_brightness
        )
        tabular_tensor = process_tabular_features(features)
        tabular_tensor = tabular_tensor.unsqueeze(0).to(device)  # Add batch dimension
        
        # Make prediction
        with torch.no_grad():
            prediction = model(image_tensor, tabular_tensor)
            predicted_value = prediction.item()
            
            # Inverse scale the prediction (reverse the scaling applied in training)
            # scaled_label = (label * 1000) - 1000, so label = (scaled_label + 1000) / 1000
            original_prediction = (predicted_value + 1000) / 1000
        
        return PredictionResponse(
            predicted_sp_refractometer=original_prediction,
            success=True,
            message="Prediction successful"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/predict_json", response_model=PredictionResponse)
async def predict_json(request: PredictionRequest):
    """Predict specific gravity from JSON request with base64 image"""
    try:
        global model, device
        
        if model is None:
            raise HTTPException(status_code=500, detail="Model not initialized")
        
        # Process image if provided
        if request.image_base64:
            image_tensor = process_image(request.image_base64)
            image_tensor = image_tensor.unsqueeze(0).to(device)
        else:
            # Create dummy image tensor if no image provided
            image_tensor = torch.zeros(1, 3, 224, 224).to(device)
        
        # Process tabular features
        tabular_tensor = process_tabular_features(request.features)
        tabular_tensor = tabular_tensor.unsqueeze(0).to(device)
        
        # Make prediction
        with torch.no_grad():
            prediction = model(image_tensor, tabular_tensor)
            predicted_value = prediction.item()
            
            # Inverse scale the prediction
            original_prediction = (predicted_value + 1000) / 1000
        
        return PredictionResponse(
            predicted_sp_refractometer=original_prediction,
            success=True,
            message="Prediction successful"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/extract_features")
async def extract_features(image: UploadFile = File(...)):
    """Extract RGB and brightness features from uploaded image"""
    try:
        # Read image
        image_data = await image.read()
        image_pil = Image.open(io.BytesIO(image_data)).convert('RGB')
        image_array = np.array(image_pil)
        
        # Calculate average RGB values
        R = float(np.mean(image_array[:, :, 0]))
        G = float(np.mean(image_array[:, :, 1]))
        B = float(np.mean(image_array[:, :, 2]))
        
        # Calculate brightness
        brightness = get_image_brightness(image_array)
        rgb_sum = R + G + B
        
        # Normalize brightness (using approximate statistics)
        mean_b = 128.0
        std_b = 64.0
        normalized_brightness = (brightness - mean_b) / std_b
        
        return {
            "R": R,
            "G": G,
            "B": B,
            "brightness": brightness,
            "rgb_sum": rgb_sum,
            "normalized_brightness": normalized_brightness
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Feature extraction failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)