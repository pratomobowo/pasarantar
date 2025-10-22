import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Package,
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useToast } from '../../contexts/ToastContext';
import { NotificationHelpers, formatErrorMessage } from '../../utils/notificationUtils';

// Types for dynamic data
interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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

interface Tag {
  id: string;
  name: string;
  color: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Function to generate slug from product name
const generateSlug = (productName: string): string => {
  return productName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
};

const productSchema = z.object({
  name: z.string().min(1, 'Nama produk harus diisi'),
  slug: z.string().min(1, 'Slug harus diisi'),
  categoryId: z.string().min(1, 'Kategori harus dipilih'),
  basePrice: z.number().min(0, 'Harga dasar harus positif'),
  description: z.string().min(1, 'Deskripsi harus diisi'),
  imageUrl: z.string().optional(),
  rating: z.number().min(0).max(5).default(0),
  reviewCount: z.number().min(0).default(0),
  tagIds: z.array(z.string()).optional(),
  variants: z.array(z.object({
    id: z.string().optional(),
    unitId: z.string().min(1, 'Satuan harus dipilih'),
    sku: z.string().optional(),
    weight: z.string().min(1, 'Berat harus diisi'),
    price: z.number().default(0),
    originalPrice: z.number().min(0, 'Harga normal harus positif'),
    inStock: z.boolean().default(true),
    barcode: z.string().optional(),
    variantCode: z.string().optional(),
    isActive: z.boolean().default(true),
    stockQuantity: z.number().min(0).default(0),
    manageStock: z.boolean().default(false),
  })).min(1, 'Minimal satu varian harus ada'),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function AddProduct() {
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      slug: '',
      categoryId: '',
      basePrice: 0,
      description: '',
      imageUrl: '',
      rating: 0,
      reviewCount: 0,
      tagIds: [],
      variants: [
        {
          unitId: '',
          weight: '',
          price: 0,
          originalPrice: 0,
          inStock: true,
          isActive: true,
          stockQuantity: 0,
          manageStock: false,
        },
      ],
    },
  });

  // Watch product name to auto-generate slug
  const watchName = watch('name');
  
  // Auto-generate slug when name changes
  useEffect(() => {
    if (watchName) {
      const generatedSlug = generateSlug(watchName);
      setValue('slug', generatedSlug);
    }
  }, [watchName, setValue]);

  // Fetch dynamic data
  const fetchCategories = async () => {
    try {
      const response = await adminApi.getActiveCategories();
      if (response.success) {
        setCategories(response.data || []);
        // Set default category if available
        if (response.data && response.data.length > 0) {
          setValue('categoryId', response.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await adminApi.getActiveUnits();
      if (response.success) {
        setUnits(response.data || []);
        // Set default unit for first variant if available
        if (response.data && response.data.length > 0) {
          setValue('variants.0.unitId', response.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await adminApi.getActiveTags();
      if (response.success) {
        setTags(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchUnits(), fetchTags()]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  const watchImageUrl = watch('imageUrl');

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: 'variants',
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }


  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Process the data
      const processedData = {
        ...data,
        imageUrl: data.imageUrl || null,
        // Process variants to handle pricing and stock logic
        variants: data.variants.map(variant => ({
          ...variant,
          // If discounted price is 0, use normal price as the price
          price: variant.price === 0 ? variant.originalPrice : variant.price,
          // Determine if product is on sale based on whether discounted price is provided and less than normal price
          originalPrice: variant.originalPrice,
          // Set inStock based on stock management
          inStock: variant.manageStock
            ? (variant.stockQuantity > 0)
            : variant.inStock,
        })),
        // Determine if product is on sale based on whether any variant has a discount
        isOnSale: data.variants.some(variant => variant.price > 0 && variant.originalPrice && variant.price < variant.originalPrice),
        discountPercentage: undefined, // Will be calculated on the backend
      };

      const response = await adminApi.createProduct(processedData);

      if (response.success) {
        setSuccess(true);
        const notification = NotificationHelpers.success('create', 'product');
        showSuccess(notification.title, notification.message);
        // Reset success state after showing the toast
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        const errorMessage = formatErrorMessage(response);
        setError(errorMessage);
        const notification = NotificationHelpers.error('create', 'product', errorMessage);
        showError(notification.title, notification.message);
      }
    } catch (err: any) {
      const errorMessage = formatErrorMessage(err);
      setError(errorMessage);
      const notification = NotificationHelpers.error('create', 'product', errorMessage);
      showError(notification.title, notification.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission with validation
  const handleSubmitWithValidation = async () => {
    // Prevent double submission
    if (isSubmitting) {
      return;
    }
    
    // Trigger form validation
    const result = await handleSubmit(
      (data) => onSubmit(data), // onValid
      (errors) => {
        // onInvalid - show validation errors in toast
        console.log('Validation errors:', errors);
        
        // Get the first error message
        let firstError = '';
        if (errors.name) {
          firstError = 'Nama produk harus diisi';
        } else if (errors.categoryId) {
          firstError = 'Kategori harus dipilih';
        } else if (errors.description) {
          firstError = 'Deskripsi harus diisi';
        } else if (errors.variants) {
          if (errors.variants.message) {
            firstError = errors.variants.message;
          } else if (Array.isArray(errors.variants)) {
            // Find the first variant with errors
            for (let i = 0; i < errors.variants.length; i++) {
              const variantErrors = errors.variants[i];
              if (variantErrors) {
                if (variantErrors.unitId) {
                  firstError = `Varian ${i + 1}: Satuan harus dipilih`;
                  break;
                } else if (variantErrors.weight) {
                  firstError = `Varian ${i + 1}: Berat harus diisi`;
                  break;
                } else if (variantErrors.originalPrice) {
                  firstError = `Varian ${i + 1}: Harga normal harus diisi`;
                  break;
                }
              }
            }
          }
        }
        
        // Show toast with the first error
        if (firstError) {
          showError('Validasi Gagal', firstError, 'top-right');
        } else {
          showError('Validasi Gagal', 'Mohon lengkapi semua field yang wajib diisi', 'top-right');
        }
      }
    )();
    
    return result;
  };

  const addVariant = () => {
    appendVariant({
      unitId: units.length > 0 ? units[0].id : '',
      weight: '',
      price: 0,
      originalPrice: 0,
      inStock: true,
      isActive: true,
      stockQuantity: 0,
      manageStock: false,
    });
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Don't show a separate success state anymore, just use toast notifications

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/admin/products')}
                className="mr-4 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Tambah Produk Baru</h1>
                <p className="text-sm text-gray-500">Tambahkan produk baru ke katalog Anda</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => navigate('/admin/products')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmitWithValidation}
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Produk"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns on large screens */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-medium text-gray-900">Informasi Dasar</h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Product Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Produk <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    {...register('name')}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    placeholder="Contoh: Ayam Kampung Segar"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                {/* Product Slug */}
                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      id="slug"
                      {...register('slug')}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      placeholder="Contoh: ayam-kampung-segar"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const nameValue = watch('name');
                        if (nameValue) {
                          const generatedSlug = generateSlug(nameValue);
                          setValue('slug', generatedSlug);
                        }
                      }}
                      className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
                      title="Generate ulang slug dari nama produk"
                    >
                      🔄
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Slug akan digenerate otomatis dari nama produk. Anda bisa mengeditnya secara manual.
                  </p>
                  {errors.slug && (
                    <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="categoryId"
                    {...register('categoryId')}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    {...register('description')}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    placeholder="Deskripsikan produk Anda secara detail..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Product Variants */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Varian Produk</h2>
                <button
                  type="button"
                  onClick={addVariant}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 transition-colors"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Tambah Varian
                </button>
              </div>
              <div className="p-6">
                {variantFields.map((field, index) => (
                  <div key={field.id} className={`border border-gray-200 rounded-lg p-4 mb-4 ${index > 0 ? 'mt-4' : ''}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-900">Varian {index + 1}</h3>
                      {variantFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Unit */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Satuan <span className="text-red-500">*</span>
                        </label>
                        <select
                          {...register(`variants.${index}.unitId`)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        >
                          <option value="">Pilih Satuan</option>
                          {units.map((unit) => (
                            <option key={unit.id} value={unit.id}>
                              {unit.name} ({unit.abbreviation})
                            </option>
                          ))}
                        </select>
                        {errors.variants?.[index]?.unitId && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.variants[index]?.unitId?.message}
                          </p>
                        )}
                      </div>

                      {/* Weight */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Berat/Jumlah <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          {...register(`variants.${index}.weight`)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                          placeholder="Contoh: 500, 1, 2.5"
                        />
                        {errors.variants?.[index]?.weight && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.variants[index]?.weight?.message}
                          </p>
                        )}
                      </div>

                      {/* SKU */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SKU
                        </label>
                        <input
                          type="text"
                          {...register(`variants.${index}.sku`)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                          placeholder="Contoh: PRD-001-KG"
                        />
                      </div>

                      {/* Barcode */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Barcode
                        </label>
                        <input
                          type="text"
                          {...register(`variants.${index}.barcode`)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                          placeholder="Contoh: 1234567890123"
                        />
                      </div>

                      {/* Price Section */}
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-4">
                        {/* Discounted Price */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Harga Diskon
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">Rp</span>
                            </div>
                            <input
                              type="number"
                              min="0"
                              {...register(`variants.${index}.price`, {
                                valueAsNumber: true,
                                onChange: (e) => {
                                  const value = e.target.value;
                                  if (value === '' || value === null || value === undefined) {
                                    setValue(`variants.${index}.price`, 0);
                                  } else {
                                    setValue(`variants.${index}.price`, parseFloat(value));
                                  }
                                }
                              })}
                              className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                              placeholder="0 untuk tidak ada diskon"
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Masukkan 0 atau kosongkan jika tidak ada diskon
                          </p>
                        </div>

                        {/* Normal Price */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Harga Normal <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">Rp</span>
                            </div>
                            <input
                              type="number"
                              min="0"
                              {...register(`variants.${index}.originalPrice`, { valueAsNumber: true })}
                              className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                              placeholder="0"
                            />
                          </div>
                          {errors.variants?.[index]?.originalPrice && (
                            <p className="mt-1 text-sm text-red-600">
                              Harga normal wajib diisi
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Stock Management */}
                      <div className="md:col-span-2 border-t border-gray-100 pt-4 mt-4">
                        <div className="space-y-4">
                          {/* Stock Management Toggle */}
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">Kelola Stok</label>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">Non-Aktif</span>
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  id={`variants.${index}.manageStock`}
                                  {...register(`variants.${index}.manageStock`)}
                                  className="sr-only"
                                />
                                <div
                                  onClick={() => {
                                    const currentValue = watch(`variants.${index}.manageStock`);
                                    setValue(`variants.${index}.manageStock`, !currentValue);
                                    // If managing stock is turned off, set inStock to true
                                    if (!currentValue) {
                                      setValue(`variants.${index}.inStock`, true);
                                    }
                                  }}
                                  className={`block w-10 h-6 rounded-full cursor-pointer transition-colors ${
                                    watch(`variants.${index}.manageStock`) ? 'bg-orange-600' : 'bg-gray-300'
                                  }`}
                                >
                                  <div
                                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                                      watch(`variants.${index}.manageStock`) ? 'translate-x-4' : 'translate-x-0'
                                    }`}
                                  />
                                </div>
                              </div>
                              <span className="text-xs text-gray-500">Aktif</span>
                            </div>
                          </div>

                          {/* Stock Quantity - Show when managing stock */}
                          {watch(`variants.${index}.manageStock`) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Jumlah Stok
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  {...register(`variants.${index}.stockQuantity`, { valueAsNumber: true })}
                                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                  placeholder="0"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Status Ketersediaan
                                </label>
                                <div className="flex items-center space-x-2">
                                  <div className={`w-3 h-3 rounded-full ${
                                    watch(`variants.${index}.inStock`) ? 'bg-green-500' : 'bg-red-500'
                                  }`}></div>
                                  <span className="text-sm text-gray-700">
                                    {watch(`variants.${index}.inStock`) ? 'Tersedia' : 'Habis'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {errors.variants && (
                  <p className="mt-1 text-sm text-red-600">{errors.variants.message}</p>
                )}
              </div>
            </div>

            {/* Product Tags */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-medium text-gray-900">Tag Produk</h2>
              </div>
              <div className="p-6">
                {tags.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {tags.map((tag) => (
                      <div key={tag.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`tag-${tag.id}`}
                          value={tag.id}
                          {...register('tagIds')}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`tag-${tag.id}`} className="ml-2 flex items-center cursor-pointer">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: tag.color }}
                          ></div>
                          <span className="text-sm text-gray-700">{tag.name}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">Belum ada tag yang tersedia</p>
                    <button
                      type="button"
                      onClick={() => navigate('/admin/tags/new')}
                      className="mt-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Buat Tag Baru
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - 1 column on large screens */}
          <div className="space-y-6">
            {/* Product Image */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-medium text-gray-900">Gambar Produk</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {/* Image Preview */}
                  <div className="flex justify-center">
                    {selectedImage ? (
                      <img
                        src={
                          selectedImage.startsWith('blob:')
                            ? selectedImage
                            : (selectedImage.startsWith('http')
                              ? selectedImage
                              : `${import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'}${selectedImage}`)
                        }
                        alt="Product preview"
                        className="h-48 w-48 object-cover rounded-lg border border-gray-200"
                      />
                    ) : (
                      <div className="h-48 w-48 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Upload className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Image URL Input */}
                  <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                      URL Gambar
                    </label>
                    <input
                      type="text"
                      id="imageUrl"
                      {...register('imageUrl')}
                      value={watchImageUrl || ''}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      placeholder="https://example.com/image.jpg"
                      onChange={(e) => {
                        setValue('imageUrl', e.target.value);
                        setSelectedImage(e.target.value);
                      }}
                    />
                  </div>

                  {/* Upload Button */}
                  <div>
                    <input
                      type="file"
                      id="imageUpload"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            setSelectedImage(null);
                            const response = await adminApi.uploadImage(file);
                            if (response.success && response.data) {
                              const imageUrl = response.data.url;
                              setSelectedImage(imageUrl);
                              setValue('imageUrl', imageUrl);
                            }
                          } catch (error) {
                            console.error('Upload error:', error);
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('imageUpload')?.click()}
                      className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Gambar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}