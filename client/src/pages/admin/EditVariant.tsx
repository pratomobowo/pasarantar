import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useToast } from '../../contexts/ToastContext';

interface Product {
  id: string;
  name: string;
}

interface Unit {
  id: string;
  name: string;
  abbreviation: string;
}

interface VariantFormData {
  productId: string;
  unitId: string;
  sku: string;
  weight: string;
  price: number;
  originalPrice: number;
  inStock: boolean;
  minOrderQuantity: number;
  barcode: string;
  variantCode: string;
  isActive: boolean;
}

interface Variant {
  id: string;
  productId: string;
  unitId: string;
  sku?: string;
  weight: string;
  price: number;
  originalPrice?: number;
  inStock: boolean;
  minOrderQuantity: number;
  barcode?: string;
  variantCode?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function EditVariant() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [formData, setFormData] = useState<VariantFormData>({
    productId: '',
    unitId: '',
    sku: '',
    weight: '',
    price: 0,
    originalPrice: 0,
    inStock: true,
    minOrderQuantity: 1,
    barcode: '',
    variantCode: '',
    isActive: true,
  });

  const fetchVariant = async () => {
    if (!id) return;

    try {
      const response = await adminApi.getVariant(id);

      if (response.success) {
        const variant = response.data;
        setFormData({
          productId: variant.productId,
          unitId: variant.unitId,
          sku: variant.sku || '',
          weight: variant.weight,
          price: variant.price,
          originalPrice: variant.originalPrice || 0,
          inStock: variant.inStock,
          minOrderQuantity: variant.minOrderQuantity,
          barcode: variant.barcode || '',
          variantCode: variant.variantCode || '',
          isActive: variant.isActive,
        });
      } else {
        showToast({
          title: 'Error',
          message: response.message || 'Failed to load variant',
          type: 'error',
        });
        navigate('/admin/variants');
      }
    } catch (error) {
      console.error('Error fetching variant:', error);
      showToast({
        title: 'Network Error',
        message: 'Failed to load variant',
        type: 'error',
      });
      navigate('/admin/variants');
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await adminApi.getProducts({ limit: 100 });

      if (response.success) {
        setProducts(response.data.products);
      } else {
        showToast({
          title: 'Error',
          message: response.message || 'Failed to load products',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      showToast({
        title: 'Network Error',
        message: 'Failed to load products',
        type: 'error',
      });
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await adminApi.getActiveUnits();

      if (response.success) {
        setUnits(response.data);
      } else {
        showToast({
          title: 'Error',
          message: response.message || 'Failed to load units',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error fetching units:', error);
      showToast({
        title: 'Network Error',
        message: 'Failed to load units',
        type: 'error',
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productId) {
      showToast({
        title: 'Validation Error',
        message: 'Product is required',
        type: 'error',
      });
      return;
    }

    if (!formData.unitId) {
      showToast({
        title: 'Validation Error',
        message: 'Unit is required',
        type: 'error',
      });
      return;
    }

    if (!formData.weight.trim()) {
      showToast({
        title: 'Validation Error',
        message: 'Weight/variant is required',
        type: 'error',
      });
      return;
    }

    if (formData.price <= 0) {
      showToast({
        title: 'Validation Error',
        message: 'Price must be greater than 0',
        type: 'error',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await adminApi.updateVariant(id!, formData);

      if (response.success) {
        showToast({
          title: 'Success',
          message: 'Variant updated successfully',
          type: 'success',
        });
        navigate('/admin/variants');
      } else {
        showToast({
          title: 'Error',
          message: response.message || 'Failed to update variant',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error updating variant:', error);
      showToast({
        title: 'Network Error',
        message: 'Failed to update variant',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchUnits();
    fetchVariant();
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
          to="/admin/variants"
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Varian</h1>
          <p className="text-gray-600">Perbarui informasi varian produk</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product */}
          <div>
            <label htmlFor="productId" className="block text-sm font-medium text-gray-700 mb-2">
              Produk <span className="text-red-500">*</span>
            </label>
            <select
              id="productId"
              name="productId"
              value={formData.productId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Pilih Produk</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          {/* Unit */}
          <div>
            <label htmlFor="unitId" className="block text-sm font-medium text-gray-700 mb-2">
              Satuan <span className="text-red-500">*</span>
            </label>
            <select
              id="unitId"
              name="unitId"
              value={formData.unitId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Pilih Satuan</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name} ({unit.abbreviation})
                </option>
              ))}
            </select>
          </div>

          {/* SKU */}
          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-2">
              SKU
            </label>
            <input
              type="text"
              id="sku"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Contoh: PRD-001-KG"
            />
          </div>

          {/* Weight */}
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
              Berat/Varian <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Contoh: 500, 1, 2.5"
            />
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              Harga <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="0"
            />
          </div>

          {/* Original Price */}
          <div>
            <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700 mb-2">
              Harga Asli (untuk diskon)
            </label>
            <input
              type="number"
              id="originalPrice"
              name="originalPrice"
              value={formData.originalPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="0"
            />
          </div>

          {/* Min Order Quantity */}
          <div>
            <label htmlFor="minOrderQuantity" className="block text-sm font-medium text-gray-700 mb-2">
              Jumlah Pesanan Minimum
            </label>
            <input
              type="number"
              id="minOrderQuantity"
              name="minOrderQuantity"
              value={formData.minOrderQuantity}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="1"
            />
          </div>

          {/* Barcode */}
          <div>
            <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-2">
              Barcode
            </label>
            <input
              type="text"
              id="barcode"
              name="barcode"
              value={formData.barcode}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Contoh: 1234567890123"
            />
          </div>

          {/* Variant Code */}
          <div>
            <label htmlFor="variantCode" className="block text-sm font-medium text-gray-700 mb-2">
              Kode Varian
            </label>
            <input
              type="text"
              id="variantCode"
              name="variantCode"
              value={formData.variantCode}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Contoh: VAR-001"
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
              Varian aktif
            </label>
          </div>

          {/* In Stock Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="inStock"
              name="inStock"
              checked={formData.inStock}
              onChange={handleChange}
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            />
            <label htmlFor="inStock" className="ml-2 block text-sm text-gray-900">
              Tersedia dalam stok
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link
              to="/admin/variants"
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