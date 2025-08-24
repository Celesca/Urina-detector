import React from 'react';
import type { ColorPickerState } from '../types';

interface ColorPickerDisplayProps {
  colorPicker: ColorPickerState;
  className?: string;
}

export const ColorPickerDisplay: React.FC<ColorPickerDisplayProps> = ({ 
  colorPicker, 
  className = "" 
}) => {
  return (
    <div className={`p-4 bg-gray-50 rounded-lg ${className}`}>
      <h3 className="font-semibold text-gray-800 mb-3">Selected Color</h3>
      <div className="flex items-center space-x-4">
        <div
          className="w-12 h-12 rounded-lg border-2 shadow-md"
          style={{ backgroundColor: `rgb(${colorPicker.rgb.join(',')})` }}
        />
        <div className="space-y-1">
          <p className="text-sm text-gray-600">
            <span className="font-medium">RGB:</span> ({colorPicker.rgb.join(', ')})
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Position:</span> ({Math.round(colorPicker.x)}, {Math.round(colorPicker.y)})
          </p>
          <p className="text-xs text-gray-500">
            Hex: #{colorPicker.rgb.map(c => c.toString(16).padStart(2, '0')).join('').toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ColorPickerDisplay;
