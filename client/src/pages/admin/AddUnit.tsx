import { adminApi } from '../../services/adminApi';
import { useAdminForm } from '../../hooks/useAdminForm';
import { FormHeader, FormActions, FormField, TextInput, Textarea, Checkbox } from '../../components/admin/shared';

interface UnitFormData {
  name: string;
  abbreviation: string;
  description: string;
  isActive: boolean;
}

export default function AddUnit() {
  const defaultData: UnitFormData = {
    name: '',
    abbreviation: '',
    description: '',
    isActive: true,
  };

  const validateForm = (data: UnitFormData): string | null => {
    if (!data.name.trim()) {
      return 'Nama satuan wajib diisi';
    }
    if (!data.abbreviation.trim()) {
      return 'Singkatan satuan wajib diisi';
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
  } = useAdminForm<UnitFormData>(defaultData, {
    onSubmit: (data) => adminApi.createUnit(data),
    onSuccessMessage: 'Satuan berhasil ditambahkan',
    onSuccessRedirect: '/admin/units',
    validateForm,
  });

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
          <h3 className="mt-4 text-lg font-medium text-gray-900">Menyimpan satuan...</h3>
          <p className="mt-2 text-sm text-gray-500">Satuan berhasil ditambahkan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <FormHeader
        title="Tambah Satuan"
        subtitle="Tambah satuan ukur baru"
        backTo="/admin/units"
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
          <FormField label="Nama Satuan" required>
            <TextInput
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Contoh: Kilogram, Gram, Liter"
              required
            />
          </FormField>

          {/* Abbreviation */}
          <FormField label="Singkatan" required>
            <TextInput
              name="abbreviation"
              value={formData.abbreviation}
              onChange={handleChange}
              placeholder="Contoh: kg, g, L"
              required
            />
          </FormField>

          {/* Description */}
          <FormField label="Deskripsi">
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Deskripsi satuan ukur"
            />
          </FormField>

          {/* Active Status */}
          <Checkbox
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            label="Satuan aktif"
          />

          {/* Form Actions */}
          <FormActions
            cancelTo="/admin/units"
            loading={loading}
          />
        </form>
      </div>
    </div>
  );
}