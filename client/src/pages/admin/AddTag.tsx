import { useState } from 'react';
import { adminApi } from '../../services/adminApi';
import { useAdminForm } from '../../hooks/useAdminForm';
import { 
  FormHeader, 
  FormActions, 
  FormField, 
  TextInput, 
  Textarea, 
  Checkbox, 
  ColorPicker 
} from '../../components/admin/shared';

interface TagFormData {
  name: string;
  color: string;
  description: string;
  isActive: boolean;
}

export default function AddTag() {
  const defaultData: TagFormData = {
    name: '',
    color: '#3B82F6',
    description: '',
    isActive: true,
  };

  const validateForm = (data: TagFormData): string | null => {
    if (!data.name.trim()) {
      return 'Nama tag wajib diisi';
    }
    // Validate hex color
    if (!/^#[0-9A-F]{6}$/i.test(data.color)) {
      return 'Warna harus berformat hex yang valid (contoh: #3B82F6)';
    }
    return null;
  };

  const {
    formData,
    loading,
    error,
    success,
    handleChange,
    handleSubmit,
    setError,
    setFormData,
  } = useAdminForm<TagFormData>(defaultData, {
    onSubmit: (data) => adminApi.createTag(data),
    onSuccessMessage: 'Tag berhasil ditambahkan',
    onSuccessRedirect: '/admin/tags',
    validateForm,
  });

  const handleColorChange = (color: string) => {
    setFormData(prev => ({ ...prev, color }));
  };

  // Success state is now handled by toast notification
  if (success) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Menyimpan tag...</h3>
          <p className="mt-2 text-sm text-gray-500">Tag berhasil ditambahkan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <FormHeader
        title="Tambah Tag"
        subtitle="Tambah tag produk baru"
        backTo="/admin/tags"
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setError(null)}
                  className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <FormField label="Nama Tag" required>
            <TextInput
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Contoh: Organik, Premium, Segar"
              required
            />
          </FormField>

          {/* Color */}
          <ColorPicker
            value={formData.color}
            onChange={handleColorChange}
            label="Warna Tag"
            required
          />

          {/* Description */}
          <FormField label="Deskripsi">
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Deskripsi tag produk"
            />
          </FormField>

          {/* Active Status */}
          <Checkbox
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            label="Tag aktif"
          />

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview
            </label>
            <div className="flex items-center space-x-2">
              <div 
                className="px-3 py-1 rounded-full text-white text-sm font-medium"
                style={{ backgroundColor: formData.color }}
              >
                {formData.name || 'Nama Tag'}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <FormActions
            cancelTo="/admin/tags"
            loading={loading}
          />
        </form>
      </div>
    </div>
  );
}