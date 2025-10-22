import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { NotificationHelpers, formatErrorMessage } from '../../utils/notificationUtils';
import { adminApi } from '../../services/adminApi';

interface CategoryFormData {
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function EditCategory() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { success: showSuccess, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    imageUrl: '',
    isActive: true,
  });

  const fetchCategory = async () => {
    if (!id) return;

    try {
      const response = await adminApi.getCategory(id);

      if (response.success) {
        const category = response.data;
        setFormData({
          name: category.name,
          description: category.description || '',
          imageUrl: category.imageUrl || '',
          isActive: category.isActive,
        });
      } else {
        const errorMessage = formatErrorMessage(response);
        const notification = NotificationHelpers.error('update', 'category', errorMessage);
        showError(notification.title, notification.message);
        navigate('/admin/categories');
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      const errorMessage = formatErrorMessage(error);
      const notification = NotificationHelpers.error('update', 'category', errorMessage);
      showError(notification.title, notification.message);
      navigate('/admin/categories');
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
      const notification = NotificationHelpers.warning('required_field', 'Nama kategori wajib diisi');
      showError(notification.title, notification.message);
      return;
    }

    setLoading(true);

    try {
      const response = await adminApi.updateCategory(id!, formData);

      if (response.success) {
        const notification = NotificationHelpers.success('update', 'category');
        showSuccess(notification.title, notification.message);
        navigate('/admin/categories');
      } else {
        const errorMessage = formatErrorMessage(response);
        const notification = NotificationHelpers.error('update', 'category', errorMessage);
        showError(notification.title, notification.message);
      }
    } catch (error) {
      console.error('Error updating category:', error);
      const errorMessage = formatErrorMessage(error);
      const notification = NotificationHelpers.error('update', 'category', errorMessage);
      showError(notification.title, notification.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory();
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
          to="/admin/categories"
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Kategori</h1>
          <p className="text-gray-600">Perbarui informasi kategori produk</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nama Kategori <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Contoh: Ayam, Ikan, Daging Sapi"
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
              placeholder="Deskripsi kategori produk"
            />
          </div>

          {/* Image URL */}
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
              URL Gambar
            </label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="https://example.com/image.jpg"
            />
            {formData.imageUrl && (
              <div className="mt-3">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="h-32 w-32 object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
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
              Kategori aktif
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link
              to="/admin/categories"
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