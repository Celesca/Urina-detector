// Type definitions for the Urine Detector application

export interface PredictionResult {
  predicted_sp_refractometer: number;
  success: boolean;
  message: string;
}

export interface ColorPickerState {
  x: number;
  y: number;
  rgb: [number, number, number];
}

export interface AnalysisRequest {
  file: File;
  r: number;
  g: number;
  b: number;
}

export interface ApiError {
  detail: string;
  status_code?: number;
}

// Analysis status constants
export const AnalysisStatus = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
} as const;

export type AnalysisStatusType = typeof AnalysisStatus[keyof typeof AnalysisStatus];

// Configuration constants
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000',
  ENDPOINTS: {
    PREDICT: '/predict',
    HEALTH: '/health'
  }
} as const;

export const UI_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  CANVAS_MAX_SIZE: 1024
} as const;
