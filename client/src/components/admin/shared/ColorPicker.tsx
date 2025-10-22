import { useState } from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
}

const predefinedColors = [
  '#EF4444', // red
  '#F97316', // orange
  '#F59E0B', // amber
  '#EAB308', // yellow
  '#84CC16', // lime
  '#22C55E', // green
  '#10B981', // emerald
  '#14B8A6', // teal
  '#06B6D4', // cyan
  '#0EA5E9', // sky
  '#3B82F6', // blue
  '#6366F1', // indigo
  '#8B5CF6', // violet
  '#A855F7', // purple
  '#D946EF', // fuchsia
  '#EC4899', // pink
  '#F43F5E', // rose
];

export default function ColorPicker({ value, onChange, label, required, error }: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(value);

  const handleColorSelect = (color: string) => {
    onChange(color);
    setCustomColor(color);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    onChange(color);
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <input
            type="color"
            value={customColor}
            onChange={handleCustomColorChange}
            className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
          />
          <input
            type="text"
            value={customColor}
            onChange={handleCustomColorChange}
            className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="#3B82F6"
          />
        </div>
        <div className="grid grid-cols-8 gap-2">
          {predefinedColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handleColorSelect(color)}
              className={`w-full h-8 rounded border-2 transition-all ${
                value === color ? 'border-gray-900 scale-110' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}