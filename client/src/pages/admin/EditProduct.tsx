import { useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { useEditProduct } from '../../hooks/useEditProduct';
import {
  ProductBasicInfo,
  ProductVariants,
  ProductTags,
  ProductImage,
  ProductStatus,
  FormHeader,
} from '../../components/admin/product-forms';

export default function EditProduct() {
  const {
    // State
    isSubmitting,
    isLoading,
    error,
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
    
    // Variants
    variantFields,
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
  } = useEditProduct();

  // Listen for add variant event from ProductVariants component
  useEffect(() => {
    const handleAddVariantEvent = () => {
      addVariant();
    };

    window.addEventListener('addVariant', handleAddVariantEvent);
    return () => {
      window.removeEventListener('addVariant', handleAddVariantEvent);
    };
  }, [addVariant]);


  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-orange-600" />
          <p className="mt-2 text-gray-600">Memuat data produk...</p>
        </div>
      </div>
    );
  }

  // Error state (when product is not found)
  if (error && !product) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/products')}
            className="text-gray-400 hover:text-gray-600"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Error</h1>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  // Don't show a separate success state anymore, just use toast notifications

  return (
    <div className="min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit((data) => {
        // Prevent double submission by checking isSubmitting state
        if (isSubmitting) return;
        onSubmit(data);
      })} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" noValidate>
        {/* Form Header */}
        <FormHeader navigate={navigate} isSubmitting={isSubmitting} isDirty={isDirty} />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns on large screens */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <ProductBasicInfo
              register={register}
              errors={errors}
              categories={categories}
              control={control}
              watch={watch}
              setValue={setValue}
            />

            {/* Product Variants */}
            <ProductVariants
              register={register}
              setValue={setValue}
              watch={watch}
              errors={errors}
              units={units}
              variantFields={variantFields}
              removeVariant={removeVariant}
              toggleStockManagement={toggleStockManagement}
            />

            {/* Product Tags */}
            <ProductTags
              register={register}
              watch={watch}
              setValue={setValue}
              tags={tags}
              navigate={navigate}
            />
          </div>

          {/* Sidebar - 1 column on large screens */}
          <div className="space-y-6">
            {/* Product Image */}
            <ProductImage
              register={register}
              setValue={setValue}
              watch={watch}
              selectedImage={selectedImage}
              onImageUpload={handleImageUpload}
              onImageUrlChange={handleImageUrlChange}
            />

            {/* Product Status */}
            <ProductStatus product={product} />
          </div>
        </div>
      </form>
    </div>
  );
}