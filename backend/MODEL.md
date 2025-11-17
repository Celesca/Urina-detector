# MODEL.md

This document describes the Hybrid urine-specific-gravity model used in this project, including architecture, preprocessing, training workflow, inference, deployment, limitations, and recommended next steps.

## Overview

The project predicts urine specific gravity (Sp. Refractometer) by combining image features (from urine sample photos) with tabular color features (R, G, B, brightness, rgb_sum, normalized_brightness). The hybrid model uses a pre-trained ResNet-18 to extract visual features and a lightweight MLP to process tabular features. The two branches are concatenated and passed to a final regression layer that outputs a single continuous value representing the predicted Sp. Refractometer.

## Architecture

- Image branch
  - Backbone: ResNet-18 (pre-trained weights)
  - Output: 512-d feature vector (after global pooling)

- Tabular branch
  - Input: 6 tabular features (R, G, B, brightness, rgb_sum, normalized_brightness)
  - MLP: Linear(6 -> 64) -> ReLU -> Linear(64 -> 32) -> ReLU
  - Output: 32-d feature vector

- Fusion and head
  - Concatenate image (512) + tabular (32) -> 544-d vector
  - Final regressor: Linear(544 -> 1)

## Input preprocessing

- Image
  - Resize to 224x224
  - Convert to RGB
  - Normalize using ImageNet mean/std: mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]

- Tabular
  - R/G/B values are the mean channel intensities of the image (0-255)
  - Brightness: mean grayscale intensity
  - rgb_sum: R+G+B
  - normalized_brightness: (brightness - mean_b) / std_b (mean_b and std_b estimated from training set or approximated)

## Training workflow

1. Dataset
   - Images organized by subject directories.
   - A metadata Excel/CSV containing R/G/B and target Sp.Refractometer values.

2. Preprocessing
   - Compute tabular features (R, G, B, brightness, rgb_sum, normalized_brightness).
   - Apply transforms to images (Resize, ToTensor, Normalize).
   - Scale target label: label_scaled = label * 1000 - 1000 (matching training code used in notebooks)

3. Model
   - HybridModel combining ResNet-18 image extractor and MLP for tabular data.
   - Loss: MSE (regression)
   - Optimizer: Adam
   - Training schedule: configurable epochs (e.g., 50), batch size e.g., 32.

4. Validation
   - Use train/test split (e.g., 90%/10%) or CV folds
   - Evaluate using MSE, MAE, and optionally R2

5. Checkpoints
   - Save state_dict to .pth files (e.g., 25_epochs.pth, 40_epochs.pth)

## Inference

- The backend `main.py` expects either multipart form uploads (`/predict`) or JSON with base64 image (`/predict_json`).
- The server performs:
  1. Image -> processed tensor
  2. Tabular features -> tensor
  3. Forward through model, obtain single value
  4. Inverse scale to original Sp.Refractometer: (pred + 1000)/1000

## Deployment considerations

- CPU vs GPU: the model is designed to run on CPU. If GPU available, PyTorch will use it.
- Using `opencv-python-headless` to avoid GUI dependencies in containers.
- For production, use pre-built images including required system libs or a full `python` base image to avoid missing system packages.

## Limitations

- Target scaling: The training pipeline applies a linear transform to the target; inference reverses it. Incorrect scaling will lead to erroneous outputs.
- Tabular normalization: The code currently uses approximate means/stds. For robust results, compute and store exact training statistics and apply same scaling at inference.
- Model uncertainty: No confidence intervals are provided. Consider ensembling or MC-dropout for uncertainty estimates.

## Metrics and expected performance

- Track MSE and MAE on validation/test sets.
- Use calibration plots and residual analysis to identify bias across value ranges.

## Next Steps and Improvements

1. Save and load preprocessor statistics (mean/std for brightness) with the model artifact.
2. Add unit tests for preprocessing functions (feature extraction and normalization).
3. Add CI workflow to build and smoke-test the Docker image.
4. Explore LightGBM on tabular features as a baseline and compare performance.
5. Consider converting model to ONNX or TorchScript for faster CPU inference.

## Files of interest

- `backend/main.py` - FastAPI server and inference implementation
- `frontend/src/utils/api.ts` - Frontend API client
- `models/*.pth` - Saved model checkpoints
- Notebook `urine-detector-new-ver-1.ipynb` - Training experiments and preprocessing code

---

If you'd like, I can also add a short section with exact training hyperparameters (optimizer settings, learning rate schedule) if you provide them or I can extract them from the notebook. Would you like that?