import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { adminApi } from '../services/adminApi';
import { ProductWithVariants, Category, Unit, Tag } from 'shared/dist/types';
import { useToast } from '../contexts/ToastContext';
import { NotificationHelpers, formatErrorMessage } from '../utils/notificationUtils';

// Function to generate slug from product name
const generateSlug = (productName: string): string => {
  return productName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
};

// Zod schema for product validation
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

export type ProductFormData = z.infer<typeof productSchema>;

export const useEditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToast();
  
  // State management
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [product, setProduct] = useState<ProductWithVariants | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  // Form management
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  // Field array for variants
  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: 'variants',
  });

  // Watch image URL for preview
  const watchImageUrl = watch('imageUrl');
  
  // Watch product name to auto-generate slug
  const watchName = watch('name');

  // Data fetching functions
  const fetchCategories = async () => {
    try {
      const response = await adminApi.getActiveCategories();
      if (response.success) {
        setCategories(response.data || []);
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

  const fetchProduct = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const response = await adminApi.getProduct(id);

      if (response.success && response.data) {
        const productData = response.data;
        setProduct(productData);

        // Reset form with product data
        reset({
          name: productData.name,
          slug: productData.slug || generateSlug(productData.name),
          categoryId: productData.categoryId,
          basePrice: productData.basePrice,
          description: productData.description,
          imageUrl: productData.imageUrl || '',
          rating: productData.rating,
          reviewCount: productData.reviewCount,
          tagIds: (productData as any).tagIds || [],
          variants: productData.variants.map(variant => ({
            id: variant.id,
            unitId: variant.unitId,
            weight: variant.weight,
            price: variant.price,
            originalPrice: variant.originalPrice,
            inStock: variant.inStock,
            isActive: variant.isActive !== false,
            stockQuantity: (variant as any).stockQuantity || 0,
            manageStock: (variant as any).manageStock || false,
          })),
        });
        
        // Set the selected image
        setSelectedImage(productData.imageUrl || null);
      } else {
        setError(response.message || 'Produk tidak ditemukan');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat mengambil data produk');
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchCategories(), fetchUnits(), fetchTags()]);
    };
    
    loadData();
  }, []);

  // Load product data when ID changes
  useEffect(() => {
    fetchProduct();
  }, [id, reset]);

  // Auto-generate slug when name changes (only for new products or if slug is empty)
  useEffect(() => {
    if (watchName && !product?.slug) {
      const generatedSlug = generateSlug(watchName);
      setValue('slug', generatedSlug);
    }
  }, [watchName, setValue, product?.slug]);

  // Form submission handler
  const onSubmit = async (data: ProductFormData) => {
    if (!id) return;

    try {
      setIsSubmitting(true);
      setError(null);
      
      console.log('Form submission started with data:', data);

      // Process the data
      console.log('DEBUG: Starting data processing');
      const processedData = {
        ...data,
        imageUrl: data.imageUrl || null,
        // Process variants to handle pricing and stock logic
        variants: data.variants.map(variant => {
          console.log('DEBUG: Processing variant:', variant);
          const processedVariant = {
            ...variant,
            // If discounted price is 0, use normal price as the price
            price: variant.price === 0 ? variant.originalPrice : variant.price,
            // Determine if product is on sale based on whether discounted price is provided and less than normal price
            originalPrice: variant.originalPrice,
            // Set inStock based on stock management
            inStock: variant.manageStock
              ? (variant.stockQuantity > 0)
              : variant.inStock,
          };
          
          // Remove client-only fields that aren't expected by the server
          delete (processedVariant as any).stockQuantity;
          delete (processedVariant as any).manageStock;
          
          console.log('DEBUG: Processed variant:', processedVariant);
          return processedVariant;
        }),
        // Determine if product is on sale based on whether any variant has a discount
        isOnSale: data.variants.some(variant => variant.price > 0 && variant.originalPrice && variant.price < variant.originalPrice),
        discountPercentage: undefined, // Will be calculated on the backend
      };
      
      console.log('DEBUG: Processed data for API:', processedData);
      console.log('DEBUG: About to call adminApi.updateProduct');

      const response = await adminApi.updateProduct(id, processedData);
      console.log('DEBUG: API response received:', response);

      if (response.success) {
        console.log('Product update successful, showing toast');
        const notification = NotificationHelpers.success('update', 'product');
        console.log('Notification created:', notification);
        // Show toast with explicit position to ensure it's visible
        showSuccess(notification.title, notification.message, 'top-right');
        console.log('Toast shown successfully');
        // Don't set success to true to prevent redirect, just show the toast
      } else {
        const errorMessage = formatErrorMessage(response);
        setError(errorMessage);
        const notification = NotificationHelpers.error('update', 'product', errorMessage);
        showError(notification.title, notification.message);
      }
    } catch (err: any) {
      console.error('Error during submission:', err);
      const errorMessage = formatErrorMessage(err);
      setError(errorMessage);
      const notification = NotificationHelpers.error('update', 'product', errorMessage);
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

  // Add new variant
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

  // Handle image upload
  const handleImageUpload = async (file: File) => {
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
  };

  // Handle image URL change
  const handleImageUrlChange = (url: string) => {
    setValue('imageUrl', url);
    setSelectedImage(url);
  };

  // Toggle stock management for a variant
  const toggleStockManagement = (index: number) => {
    const currentValue = watch(`variants.${index}.manageStock`);
    setValue(`variants.${index}.manageStock`, !currentValue);
    // If managing stock is turned off, set inStock to true
    if (!currentValue) {
      setValue(`variants.${index}.inStock`, true);
    }
  };

  return {
    // State
    isSubmitting,
    isLoading,
    error,
    success,
    product,
    selectedImage,
    categories,
    units,
    tags,
    
    // Form
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    errors,
    isDirty,
    watchImageUrl,
    
    // Variants
    variantFields,
    appendVariant,
    removeVariant,
    
    // Actions
    onSubmit,
    handleSubmitWithValidation,
    addVariant,
    handleImageUpload,
    handleImageUrlChange,
    toggleStockManagement,
    setError,
    
    // Navigation
    navigate,
    
    // Slug utilities
    generateSlug,
  };
};