/**
 * Notification utility service for consistent message formatting
 * across the BHVR admin dashboard
 */

export const NotificationMessages = {
  // Success messages
  SUCCESS: {
    CREATE: {
      PRODUCT: 'Produk berhasil ditambahkan',
      CATEGORY: 'Kategori berhasil ditambahkan',
      UNIT: 'Satuan berhasil ditambahkan',
      TAG: 'Tag berhasil ditambahkan',
      VARIANT: 'Varian berhasil ditambahkan',
      CUSTOMER: 'Pelanggan berhasil ditambahkan',
      ORDER: 'Pesanan berhasil dibuat',
    },
    UPDATE: {
      PRODUCT: 'Produk berhasil diperbarui',
      CATEGORY: 'Kategori berhasil diperbarui',
      UNIT: 'Satuan berhasil diperbarui',
      TAG: 'Tag berhasil diperbarui',
      VARIANT: 'Varian berhasil diperbarui',
      CUSTOMER: 'Data pelanggan berhasil diperbarui',
      ORDER: 'Pesanan berhasil diperbarui',
    },
    DELETE: {
      PRODUCT: 'Produk berhasil dihapus',
      CATEGORY: 'Kategori berhasil dihapus',
      UNIT: 'Satuan berhasil dihapus',
      TAG: 'Tag berhasil dihapus',
      VARIANT: 'Varian berhasil dihapus',
      CUSTOMER: 'Pelanggan berhasil dihapus',
      ORDER: 'Pesanan berhasil dihapus',
    },
    UPLOAD: {
      IMAGE: 'Gambar berhasil diunggah',
      DOCUMENT: 'Dokumen berhasil diunggah',
    },
    GENERIC: 'Operasi berhasil dilakukan',
  },
  
  // Error messages
  ERROR: {
    CREATE: {
      PRODUCT: 'Gagal menambahkan produk',
      CATEGORY: 'Gagal menambahkan kategori',
      UNIT: 'Gagal menambahkan satuan',
      TAG: 'Gagal menambahkan tag',
      VARIANT: 'Gagal menambahkan varian',
      CUSTOMER: 'Gagal menambahkan pelanggan',
      ORDER: 'Gagal membuat pesanan',
    },
    UPDATE: {
      PRODUCT: 'Gagal memperbarui produk',
      CATEGORY: 'Gagal memperbarui kategori',
      UNIT: 'Gagal memperbarui satuan',
      TAG: 'Gagal memperbarui tag',
      VARIANT: 'Gagal memperbarui varian',
      CUSTOMER: 'Gagal memperbarui data pelanggan',
      ORDER: 'Gagal memperbarui pesanan',
    },
    DELETE: {
      PRODUCT: 'Gagal menghapus produk',
      CATEGORY: 'Gagal menghapus kategori',
      UNIT: 'Gagal menghapus satuan',
      TAG: 'Gagal menghapus tag',
      VARIANT: 'Gagal menghapus varian',
      CUSTOMER: 'Gagal menghapus pelanggan',
      ORDER: 'Gagal menghapus pesanan',
    },
    UPLOAD: {
      IMAGE: 'Gagal mengunggah gambar',
      DOCUMENT: 'Gagal mengunggah dokumen',
    },
    NETWORK: 'Terjadi kesalahan jaringan',
    VALIDATION: 'Data yang dimasukkan tidak valid',
    PERMISSION: 'Anda tidak memiliki izin untuk melakukan operasi ini',
    GENERIC: 'Terjadi kesalahan',
  },
  
  // Warning messages
  WARNING: {
    UNSAVED_CHANGES: 'Ada perubahan yang belum disimpan',
    DELETE_CONFIRM: 'Apakah Anda yakin ingin menghapus item ini?',
    REQUIRED_FIELD: 'Field ini wajib diisi',
    INVALID_FORMAT: 'Format data tidak valid',
    GENERIC: 'Perhatian',
  },
  
  // Info messages
  INFO: {
    LOADING: 'Memuat data...',
    SAVING: 'Menyimpan data...',
    PROCESSING: 'Memproses permintaan...',
    NO_DATA: 'Tidak ada data tersedia',
    GENERIC: 'Informasi',
  },
};

/**
 * Get notification message by type and action
 */
export const getNotificationMessage = (
  type: 'success' | 'error' | 'warning' | 'info',
  action?: 'create' | 'update' | 'delete' | 'upload',
  entity?: string,
  customMessage?: string
): { title: string; message?: string } => {
  const upperType = type.toUpperCase() as keyof typeof NotificationMessages.SUCCESS | keyof typeof NotificationMessages.ERROR | keyof typeof NotificationMessages.WARNING | keyof typeof NotificationMessages.INFO;
  
  // If custom message is provided, use it
  if (customMessage) {
    return {
      title: type === 'success' ? 'Berhasil' : type === 'error' ? 'Gagal' : type === 'warning' ? 'Perhatian' : 'Informasi',
      message: customMessage,
    };
  }
  
  // If action and entity are provided, get specific message
  if (action && entity) {
    const upperAction = action.toUpperCase() as keyof typeof NotificationMessages.SUCCESS.CREATE;
    const upperEntity = entity.toUpperCase() as keyof typeof NotificationMessages.SUCCESS.CREATE.PRODUCT;
    
    const messageGroup = NotificationMessages[upperType] as any;
    if (messageGroup && messageGroup[upperAction] && messageGroup[upperAction][upperEntity]) {
      return {
        title: type === 'success' ? 'Berhasil' : type === 'error' ? 'Gagal' : type === 'warning' ? 'Perhatian' : 'Informasi',
        message: messageGroup[upperAction][upperEntity],
      };
    }
  }
  
  // Return generic message
  return {
    title: type === 'success' ? 'Berhasil' : type === 'error' ? 'Gagal' : type === 'warning' ? 'Perhatian' : 'Informasi',
    message: NotificationMessages[upperType].GENERIC,
  };
};

/**
 * Format error message from API response
 */
export const formatErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (error?.error) {
    return error.error;
  }
  
  return NotificationMessages.ERROR.GENERIC;
};

/**
 * Notification helper functions for common operations
 */
export const NotificationHelpers = {
  // Success notifications
  success: (action: 'create' | 'update' | 'delete' | 'upload', entity: string, customMessage?: string) => 
    getNotificationMessage('success', action, entity, customMessage),
  
  // Error notifications
  error: (action: 'create' | 'update' | 'delete' | 'upload', entity: string, error?: any) => 
    getNotificationMessage('error', action, entity, formatErrorMessage(error)),
  
  // Warning notifications
  warning: (type: 'unsaved_changes' | 'delete_confirm' | 'required_field' | 'invalid_format', customMessage?: string) => {
    const typeMap = {
      unsaved_changes: 'UNSAVED_CHANGES',
      delete_confirm: 'DELETE_CONFIRM',
      required_field: 'REQUIRED_FIELD',
      invalid_format: 'INVALID_FORMAT',
    };
    
    const messageType = NotificationMessages.WARNING[typeMap[type] as keyof typeof NotificationMessages.WARNING];
    
    return {
      title: 'Perhatian',
      message: customMessage || messageType,
    };
  },
  
  // Info notifications
  info: (type: 'loading' | 'saving' | 'processing' | 'no_data', customMessage?: string) => {
    const typeMap = {
      loading: 'LOADING',
      saving: 'SAVING',
      processing: 'PROCESSING',
      no_data: 'NO_DATA',
    };
    
    const messageType = NotificationMessages.INFO[typeMap[type] as keyof typeof NotificationMessages.INFO];
    
    return {
      title: 'Informasi',
      message: customMessage || messageType,
    };
  },
};