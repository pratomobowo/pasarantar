import { useState, useEffect } from 'react';
import { useForm, useController, Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X, Globe, Mail, Clock, Facebook, Instagram, Twitter, Youtube, Linkedin } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { WebsiteSettings, BusinessHours, SocialMediaLinks } from 'shared/dist/types';
import FormHeader from '../../components/admin/shared/FormHeader';
import FormField, { TextInput, Textarea } from '../../components/admin/shared/FormField';
import { useToast } from '../../contexts/ToastContext';

// Validation schema
const settingsSchema = z.object({
  siteName: z.string().min(1, 'Nama situs wajib diisi').max(255, 'Nama situs maksimal 255 karakter'),
  siteDescription: z.string().max(1000, 'Deskripsi maksimal 1000 karakter').optional(),
  metaTitle: z.string().max(255, 'Meta title maksimal 255 karakter').optional(),
  metaDescription: z.string().max(500, 'Meta description maksimal 500 karakter').optional(),
  contactEmail: z.string().email('Email tidak valid').optional().or(z.literal('')),
  contactPhone: z.string().max(50, 'Nomor telepon maksimal 50 karakter').optional(),
  contactAddress: z.string().max(1000, 'Alamat maksimal 1000 karakter').optional(),
  hideSiteNameAndDescription: z.boolean().optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

const daysOfWeek = [
  { key: 'monday', label: 'Senin' },
  { key: 'tuesday', label: 'Selasa' },
  { key: 'wednesday', label: 'Rabu' },
  { key: 'thursday', label: 'Kamis' },
  { key: 'friday', label: 'Jumat' },
  { key: 'saturday', label: 'Sabtu' },
  { key: 'sunday', label: 'Minggu' },
];

// Helper components to integrate with react-hook-form
function ControllerTextInput({ name, control, placeholder, type = 'text', error }: {
  name: keyof SettingsFormData;
  control: Control<SettingsFormData>;
  placeholder?: string;
  type?: 'text' | 'email' | 'url' | 'number';
  error?: string;
}) {
  const {
    field,
    fieldState: { error: fieldError },
  } = useController({
    name,
    control,
  });

  return (
    <TextInput
      name={name}
      value={field.value as string || ''}
      onChange={field.onChange}
      onBlur={field.onBlur}
      ref={field.ref}
      placeholder={placeholder}
      type={type}
      error={fieldError?.message || error}
    />
  );
}

function ControllerTextarea({ name, control, placeholder, rows = 4, error }: {
  name: keyof SettingsFormData;
  control: Control<SettingsFormData>;
  placeholder?: string;
  rows?: number;
  error?: string;
}) {
  const {
    field,
    fieldState: { error: fieldError },
  } = useController({
    name,
    control,
  });

  return (
    <Textarea
      name={name}
      value={field.value as string || ''}
      onChange={field.onChange}
      onBlur={field.onBlur}
      ref={field.ref}
      placeholder={placeholder}
      rows={rows}
      error={fieldError?.message || error}
    />
  );
}

export default function Settings() {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [hideSiteNameAndDescription, setHideSiteNameAndDescription] = useState(false);
  const { success: showSuccess, error: showError } = useToast();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  });

  const [businessHours, setBusinessHours] = useState<BusinessHours>({
    monday: { open: '08:00', close: '17:00', closed: false },
    tuesday: { open: '08:00', close: '17:00', closed: false },
    wednesday: { open: '08:00', close: '17:00', closed: false },
    thursday: { open: '08:00', close: '17:00', closed: false },
    friday: { open: '08:00', close: '17:00', closed: false },
    saturday: { open: '08:00', close: '15:00', closed: false },
    sunday: { open: '08:00', close: '15:00', closed: true },
  });

  const [socialMediaLinks, setSocialMediaLinks] = useState<SocialMediaLinks>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await adminApi.getSettings();
      if (response.success && response.data) {
        setSettings(response.data);
        reset({
          siteName: response.data.siteName,
          siteDescription: response.data.siteDescription || '',
          metaTitle: response.data.metaTitle || '',
          metaDescription: response.data.metaDescription || '',
          contactEmail: response.data.contactEmail || '',
          contactPhone: response.data.contactPhone || '',
          contactAddress: response.data.contactAddress || '',
          hideSiteNameAndDescription: response.data.hideSiteNameAndDescription || false,
        });
        setHideSiteNameAndDescription(response.data.hideSiteNameAndDescription || false);
        // Construct full URL for the existing logo
        const API_BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
        const fullImageUrl = response.data.logoUrl ?
          (response.data.logoUrl.startsWith('http') ? response.data.logoUrl : `${API_BASE_URL}${response.data.logoUrl}`)
          : '';
        setLogoPreview(fullImageUrl);
        setBusinessHours(response.data.businessHours || businessHours);
        setSocialMediaLinks(response.data.socialMediaLinks || {});
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showError('Gagal', 'Gagal memuat pengaturan');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const response = await adminApi.uploadImage(file);
      if (response.success && response.data) {
        // Construct full URL for the uploaded image
        const API_BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
        const fullImageUrl = `${API_BASE_URL}${response.data.url}`;
        setLogoPreview(fullImageUrl);
        showSuccess('Berhasil', 'Logo berhasil diunggah');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      showError('Gagal', 'Gagal mengunggah logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview('');
  };

  const handleBusinessHoursChange = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day as keyof BusinessHours],
        [field]: value,
      },
    }));
  };

  const handleSocialMediaChange = (platform: keyof SocialMediaLinks, value: string) => {
    setSocialMediaLinks(prev => ({
      ...prev,
      [platform]: value || undefined,
    }));
  };

  const onSubmit = async (data: SettingsFormData) => {
    setSaving(true);
    try {
      const updateData = {
        ...data,
        logoUrl: logoPreview || undefined,
        businessHours,
        socialMediaLinks,
        hideSiteNameAndDescription,
      };

      const response = await adminApi.updateSettings(updateData);
      if (response.success) {
        showSuccess('Berhasil', 'Pengaturan berhasil disimpan');
        if (response.data) {
          setSettings(response.data);
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showError('Gagal', 'Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FormHeader
        title="Pengaturan Website"
        subtitle="Kelola pengaturan umum, SEO, dan informasi kontak website"
        backTo="/admin"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Globe className="h-5 w-5 mr-2 text-orange-600" />
            Pengaturan Umum
          </h2>
          
          <div className="space-y-6">
            <FormField
              label="Nama Situs"
              error={errors.siteName?.message}
              required
            >
              <ControllerTextInput
                name="siteName"
                control={control}
                placeholder="Masukkan nama situs"
                error={errors.siteName?.message}
              />
            </FormField>

            <FormField
              label="Deskripsi Situs"
              error={errors.siteDescription?.message}
            >
              <ControllerTextarea
                name="siteDescription"
                control={control}
                placeholder="Masukkan deskripsi situs"
                rows={3}
                error={errors.siteDescription?.message}
              />
            </FormField>

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo Website
              </label>
              <div className="flex items-center space-x-4">
                {logoPreview ? (
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="h-20 w-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                
                <div>
                  <input
                    type="file"
                    id="logo"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="logo"
                    className="cursor-pointer bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200 inline-flex items-center"
                  >
                    {uploadingLogo ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {logoPreview ? 'Ganti Logo' : 'Unggah Logo'}
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Format: JPEG, PNG, GIF, WebP. Maksimal: 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Hide Site Name and Description Toggle */}
            <div className="flex items-center justify-between py-3 border-t border-gray-200">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Sembunyikan Nama dan Deskripsi Situs
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Jika diaktifkan, hanya logo yang akan ditampilkan di header
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHideSiteNameAndDescription(!hideSiteNameAndDescription)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                  hideSiteNameAndDescription ? 'bg-orange-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    hideSiteNameAndDescription ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* SEO Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Globe className="h-5 w-5 mr-2 text-orange-600" />
            Pengaturan SEO
          </h2>
          
          <div className="space-y-6">
            <FormField
              label="Meta Title"
              error={errors.metaTitle?.message}
              description="Direkomendasikan 50-60 karakter"
            >
              <ControllerTextInput
                name="metaTitle"
                control={control}
                placeholder="Masukkan meta title untuk SEO"
                error={errors.metaTitle?.message}
              />
            </FormField>

            <FormField
              label="Meta Description"
              error={errors.metaDescription?.message}
              description="Direkomendasikan 150-160 karakter"
            >
              <ControllerTextarea
                name="metaDescription"
                control={control}
                placeholder="Masukkan meta description untuk SEO"
                rows={3}
                error={errors.metaDescription?.message}
              />
            </FormField>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Mail className="h-5 w-5 mr-2 text-orange-600" />
            Informasi Kontak
          </h2>
          
          <div className="space-y-6">
            <FormField
              label="Email Kontak"
              error={errors.contactEmail?.message}
            >
              <ControllerTextInput
                name="contactEmail"
                control={control}
                type="email"
                placeholder="email@example.com"
                error={errors.contactEmail?.message}
              />
            </FormField>

            <FormField
              label="Telepon Kontak"
              error={errors.contactPhone?.message}
            >
              <ControllerTextInput
                name="contactPhone"
                control={control}
                placeholder="+62 812-3456-7890"
                error={errors.contactPhone?.message}
              />
            </FormField>

            <FormField
              label="Alamat"
              error={errors.contactAddress?.message}
            >
              <ControllerTextarea
                name="contactAddress"
                control={control}
                placeholder="Masukkan alamat lengkap"
                rows={3}
                error={errors.contactAddress?.message}
              />
            </FormField>
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-orange-600" />
            Jam Operasional
          </h2>
          
          <div className="space-y-4">
            {daysOfWeek.map((day) => (
              <div key={day.key} className="flex items-center space-x-4">
                <div className="w-24">
                  <label className="text-sm font-medium text-gray-700">
                    {day.label}
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={!businessHours[day.key as keyof BusinessHours].closed}
                    onChange={(e) => handleBusinessHoursChange(day.key, 'closed', !e.target.checked)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-600">Buka</label>
                </div>

                {!businessHours[day.key as keyof BusinessHours].closed && (
                  <>
                    <input
                      type="time"
                      value={businessHours[day.key as keyof BusinessHours].open}
                      onChange={(e) => handleBusinessHoursChange(day.key, 'open', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="time"
                      value={businessHours[day.key as keyof BusinessHours].close}
                      onChange={(e) => handleBusinessHoursChange(day.key, 'close', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Facebook className="h-5 w-5 mr-2 text-orange-600" />
            Media Sosial
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Facebook className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <TextInput
                  name="facebook"
                  value={socialMediaLinks.facebook || ''}
                  onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                  placeholder="https://facebook.com/username"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Instagram className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <TextInput
                  name="instagram"
                  value={socialMediaLinks.instagram || ''}
                  onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                  placeholder="https://instagram.com/username"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Twitter className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <TextInput
                  name="twitter"
                  value={socialMediaLinks.twitter || ''}
                  onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                  placeholder="https://twitter.com/username"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Youtube className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <TextInput
                  name="youtube"
                  value={socialMediaLinks.youtube || ''}
                  onChange={(e) => handleSocialMediaChange('youtube', e.target.value)}
                  placeholder="https://youtube.com/channel/username"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Linkedin className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <TextInput
                  name="linkedin"
                  value={socialMediaLinks.linkedin || ''}
                  onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/company/username"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={saving || !isDirty}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Menyimpan...
              </div>
            ) : (
              'Simpan Pengaturan'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}