/**
 * Contact utilities for handling phone numbers and contact links
 * Provides centralized contact information management
 */

// Fallback contact information in case settings are not loaded
const FALLBACK_PHONE = '+62 812-3456-7890';
const FALLBACK_WHATSAPP = '6281234567890';
const FALLBACK_TEL = '+621212345678';

/**
 * Clean and format phone number for display
 * @param phone - Raw phone number from settings
 * @returns Formatted phone number for display
 */
export function formatPhoneNumber(phone?: string): string {
  if (!phone) return FALLBACK_PHONE;
  
  // Remove any non-digit characters except + and spaces
  const cleaned = phone.replace(/[^\d+\s]/g, '');
  
  // If it starts with 0, convert to +62 format
  if (cleaned.startsWith('0')) {
    return '+62 ' + cleaned.substring(1).replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }
  
  // If it already has +62, format it nicely
  if (cleaned.startsWith('+62')) {
    const number = cleaned.substring(3);
    return '+62 ' + number.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }
  
  // Return as-is if it doesn't match expected formats
  return phone;
}

/**
 * Format phone number for WhatsApp links (remove + and spaces)
 * @param phone - Raw phone number from settings
 * @returns Phone number formatted for WhatsApp
 */
export function formatWhatsAppNumber(phone?: string): string {
  if (!phone) return FALLBACK_WHATSAPP;
  
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Convert 0 prefix to country code
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }
  
  // Ensure it has country code
  if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  
  return cleaned;
}

/**
 * Format phone number for tel: links
 * @param phone - Raw phone number from settings
 * @returns Phone number formatted for tel: links
 */
export function formatTelNumber(phone?: string): string {
  if (!phone) return FALLBACK_TEL;
  
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Convert 0 prefix to country code
  if (cleaned.startsWith('0')) {
    cleaned = '+62' + cleaned.substring(1);
  }
  
  // Ensure it has + prefix
  if (!cleaned.startsWith('+')) {
    cleaned = '+62' + cleaned;
  }
  
  return cleaned;
}

/**
 * Create WhatsApp link with optional message
 * @param phone - Phone number from settings
 * @param message - Optional pre-filled message
 * @returns Complete WhatsApp URL
 */
export function createWhatsAppLink(phone?: string, message?: string): string {
  const formattedPhone = formatWhatsAppNumber(phone);
  const text = message ? encodeURIComponent(message) : '';
  return `https://wa.me/${formattedPhone}${text ? '?text=' + text : ''}`;
}

/**
 * Create tel: link for phone calls
 * @param phone - Phone number from settings
 * @returns Complete tel: URL
 */
export function createTelLink(phone?: string): string {
  const formattedPhone = formatTelNumber(phone);
  return `tel:${formattedPhone}`;
}

/**
 * Get contact phone number with fallback
 * @param phone - Phone number from settings
 * @returns Phone number with fallback
 */
export function getContactPhone(phone?: string): string {
  return formatPhoneNumber(phone);
}

/**
 * Get WhatsApp number with fallback
 * @param phone - Phone number from settings
 * @returns WhatsApp number with fallback
 */
export function getWhatsAppNumber(phone?: string): string {
  return formatWhatsAppNumber(phone);
}

/**
 * Get tel number with fallback
 * @param phone - Phone number from settings
 * @returns Tel number with fallback
 */
export function getTelNumber(phone?: string): string {
  return formatTelNumber(phone);
}

/**
 * Default WhatsApp message templates
 */
export const WHATSAPP_MESSAGES = {
  PRODUCT_INQUIRY: (productName: string) => 
    `Halo, saya tertarik dengan produk: ${productName}. Apakah produk ini tersedia?`,
  ORDER_INQUIRY: (orderNumber: string) => 
    `Halo, saya ingin menanyakan status pesanan saya dengan nomor: ${orderNumber}`,
  GENERAL_INQUIRY: 'Halo, saya memiliki pertanyaan tentang produk dan layanan PasarAntar.',
  COMPLAINT: 'Halo, saya ingin mengajukan keluhan terkait pesanan saya.',
  COOPERATION: 'Halo, saya tertarik untuk menjalin kerjasama bisnis dengan PasarAntar.'
};