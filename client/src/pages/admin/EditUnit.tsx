import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { NotificationHelpers, formatErrorMessage } from '../../utils/notificationUtils';
import { adminApi } from '../../services/adminApi';

interface UnitFormData {
  name: string;
  abbreviation: string;
  description: string;
  isActive: boolean;
}

interface Unit {
  id: string;
  name: string;
  abbreviation: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function EditUnit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { success: showSuccess, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState<UnitFormData>({
    name: '',
    abbreviation: '',
    description: '',
    isActive: true,
  });

  const fetchUnit = async () => {
    if (!id) return;

    try {
      const response = await adminApi.getUnit(id);

      if (response.success) {
        const unit = response.data;
        setFormData({
          name: unit.name,
          abbreviation: unit.abbreviation,
          description: unit.description || '',
          isActive: unit.isActive,
        });
      } else {
        const errorMessage = formatErrorMessage(response);
        const notification = NotificationHelpers.error('update', 'unit', errorMessage);
        showError(notification.title, notification.message);
        navigate('/admin/units');
      }
    } catch (error) {
      console.error('Error fetching unit:', error);
      const errorMessage = formatErrorMessage(error);
      const notification = NotificationHelpers.error('update', 'unit', errorMessage);
      showError(notification.title, notification.message);
      navigate('/admin/units');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      const notification = NotificationHelpers.warning('required_field', 'Nama satuan wajib diisi');
      showError(notification.title, notification.message);
      return;
    }

    if (!formData.abbreviation.trim()) {
      const notification = NotificationHelpers.warning('required_field', 'Singkatan satuan wajib diisi');
      showError(notification.title, notification.message);
      return;
    }

    setLoading(true);

    try {
      const response = await adminApi.updateUnit(id!, formData);

      if (response.success) {
        const notification = NotificationHelpers.success('update', 'unit');
        showSuccess(notification.title, notification.message);
        navigate('/admin/units');
      } else {
        const errorMessage = formatErrorMessage(response);
        const notification = NotificationHelpers.error('update', 'unit', errorMessage);
        showError(notification.title, notification.message);
      }
    } catch (error) {
      console.error('Error updating unit:', error);
      const errorMessage = formatErrorMessage(error);
      const notification = NotificationHelpers.error('update', 'unit', errorMessage);
      showError(notification.title, notification.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnit();
  }, [id]);

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center">
        <Link
          to="/admin/units"
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Satuan</h1>
          <p className="text-gray-600">Perbarui informasi satuan ukur</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nama Satuan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Contoh: Kilogram, Gram, Liter"
            />
          </div>

          {/* Abbreviation */}
          <div>
            <label htmlFor="abbreviation" className="block text-sm font-medium text-gray-700 mb-2">
              Singkatan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="abbreviation"
              name="abbreviation"
              value={formData.abbreviation}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Contoh: kg, g, L"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Deskripsi satuan ukur"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Satuan aktif
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link
              to="/admin/units"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 flex items-center disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}