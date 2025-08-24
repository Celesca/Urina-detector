import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { PredictionResult } from '../types';
import { API_CONFIG } from '../types';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// API function to predict urine analysis
export const predictUrineAnalysis = async (
  file: File,
  r: number,
  g: number,
  b: number
): Promise<PredictionResult> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('r', r.toString());
  formData.append('g', g.toString());
  formData.append('b', b.toString());

  try {
    const response: AxiosResponse<PredictionResult> = await apiClient.post(
      API_CONFIG.ENDPOINTS.PREDICT,
      formData
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Failed to analyze the image');
    }
    throw new Error('An unexpected error occurred');
  }
};

// API function to check server health
export const checkServerHealth = async (): Promise<{ status: string }> => {
  try {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.HEALTH);
    return response.data;
  } catch (error) {
    throw new Error('Server is not responding');
  }
};

export default apiClient;
