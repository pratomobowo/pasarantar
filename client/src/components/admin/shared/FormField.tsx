import { ReactNode, forwardRef } from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  description?: string;
}

export default function FormField({ label, required, error, children, description }: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {description && (
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

interface TextInputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'url' | 'number';
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(({
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  type = 'text',
  required,
  disabled,
  error
}, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      required={required}
      disabled={disabled}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
        error ? 'border-red-300' : 'border-gray-300'
      } ${disabled ? 'bg-gray-100' : ''}`}
      placeholder={placeholder}
    />
  );
});

interface TextareaProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  rows = 4,
  required,
  disabled,
  error
}, ref) => {
  return (
    <textarea
      ref={ref}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      required={required}
      disabled={disabled}
      rows={rows}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
        error ? 'border-red-300' : 'border-gray-300'
      } ${disabled ? 'bg-gray-100' : ''}`}
      placeholder={placeholder}
    />
  );
});

interface CheckboxProps {
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  disabled?: boolean;
}

export function Checkbox({ name, checked, onChange, label, disabled }: CheckboxProps) {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={name}
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
      />
      <label htmlFor={name} className="ml-2 block text-sm text-gray-900">
        {label}
      </label>
    </div>
  );
}

interface SelectProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

export function Select({ 
  name, 
  value, 
  onChange, 
  options, 
  placeholder, 
  required,
  disabled,
  error 
}: SelectProps) {
  return (
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
        error ? 'border-red-300' : 'border-gray-300'
      } ${disabled ? 'bg-gray-100' : ''}`}
    >
      {placeholder && (
        <option value="">{placeholder}</option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}