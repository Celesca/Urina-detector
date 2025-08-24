import React, { useState, useRef, useCallback } from 'react';
import { Upload, Camera, Droplets, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import type { PredictionResult, ColorPickerState } from './types';
import { predictUrineAnalysis } from './utils/api';
import { ColorPickerDisplay, ErrorAlert } from './components';
import './App.css';

function App() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string>('');
  const [colorPicker, setColorPicker] = useState<ColorPickerState | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setSelectedImage(file);
      setResult(null);
      setError('');
      setShowColorPicker(false);
      setColorPicker(null);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleUploadAreaClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setSelectedImage(file);
      setResult(null);
      setError('');
      setShowColorPicker(false);
      setColorPicker(null);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleImageClick = useCallback((event: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current || !canvasRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Get the actual image dimensions
    const img = imageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Draw image on canvas
    ctx.drawImage(img, 0, 0);

    // Calculate the actual pixel position on the original image
    const scaleX = img.naturalWidth / img.clientWidth;
    const scaleY = img.naturalHeight / img.clientHeight;
    const pixelX = Math.floor(x * scaleX);
    const pixelY = Math.floor(y * scaleY);

    // Get pixel data
    const imageData = ctx.getImageData(pixelX, pixelY, 1, 1);
    const [r, g, b] = imageData.data;

    setColorPicker({
      x: x,
      y: y,
      rgb: [r, g, b]
    });
    setShowColorPicker(true);
  }, []);

  const handleAnalyze = async () => {
    if (!selectedImage || !colorPicker) {
      setError('Please upload an image and select a color point');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await predictUrineAnalysis(
        selectedImage,
        colorPicker.rgb[0],
        colorPicker.rgb[1],
        colorPicker.rgb[2]
      );
      setResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setImagePreview('');
    setResult(null);
    setError('');
    setColorPicker(null);
    setShowColorPicker(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Droplets className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">Urine Detector</h1>
          </div>
          <p className="text-lg text-gray-600">
            Upload an image, select a color point, and get instant analysis results
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <Upload className="h-6 w-6 mr-2 text-blue-600" />
                Upload Image
              </h2>

              {!imagePreview ? (
                <div 
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer upload-area ${
                    isDragOver 
                      ? 'border-blue-500 bg-blue-50 drag-over' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                  onClick={handleUploadAreaClick}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Camera className={`h-16 w-16 mx-auto mb-4 transition-colors ${
                    isDragOver ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  <p className={`mb-4 transition-colors ${
                    isDragOver ? 'text-blue-700 font-medium' : 'text-gray-600'
                  }`}>
                    {isDragOver ? 'Drop your image here' : 'Click to upload an image or drag and drop'}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Supports JPG, PNG, WebP (max 10MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {!isDragOver && (
                    <button 
                      type="button"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors file-input-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUploadAreaClick();
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      ref={imageRef}
                      src={imagePreview}
                      alt="Uploaded preview"
                      className="w-full h-64 object-contain rounded-lg border crosshair"
                      onClick={handleImageClick}
                    />
                    
                    {showColorPicker && colorPicker && (
                      <div
                        className="color-picker-point"
                        style={{
                          left: colorPicker.x,
                          top: colorPicker.y,
                          backgroundColor: `rgb(${colorPicker.rgb.join(',')})`
                        }}
                      />
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 text-center">
                    Click on the image to select a color point for analysis
                  </p>
                  
                  <button
                    onClick={resetAnalysis}
                    className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Upload Different Image
                  </button>
                </div>
              )}

              {/* Color Picker Info */}
              {colorPicker && (
                <ColorPickerDisplay colorPicker={colorPicker} className="mt-6" />
              )}
            </div>

            {/* Analysis Section */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <AlertCircle className="h-6 w-6 mr-2 text-blue-600" />
                Analysis Results
              </h2>

              {!result && !error && !isLoading && (
                <div className="text-center py-8">
                  <Droplets className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Upload an image and select a color to see analysis results
                  </p>
                </div>
              )}

              {error && (
                <ErrorAlert 
                  message={error} 
                  onDismiss={() => setError('')}
                  className="mb-4"
                />
              )}

              {result && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span className="font-semibold text-green-800">Analysis Complete</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Prediction</label>
                        <p className="text-lg font-bold text-gray-900 capitalize">
                          {result.prediction}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Confidence</label>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full confidence-bar"
                              style={{ width: `${result.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {(result.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">RGB Values</label>
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: `rgb(${result.rgb_values.join(',')})` }}
                          />
                          <span className="text-sm text-gray-900">
                            R: {result.rgb_values[0]}, G: {result.rgb_values[1]}, B: {result.rgb_values[2]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="mt-6">
                <button
                  onClick={handleAnalyze}
                  disabled={!selectedImage || !colorPicker || isLoading}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                    selectedImage && colorPicker && !isLoading
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="h-5 w-5" />
                      <span>Analyze Image</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden canvas for color picking */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}

export default App;
