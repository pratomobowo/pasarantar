import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { WebsiteSettings } from 'shared/dist/types';
import {
  formatPhoneNumber,
  formatWhatsAppNumber,
  formatTelNumber,
  createWhatsAppLink,
  createTelLink,
  getContactPhone,
  getWhatsAppNumber,
  getTelNumber,
  WHATSAPP_MESSAGES
} from '../utils/contactUtils';

interface SettingsContextType {
  settings: WebsiteSettings | null;
  loading: boolean;
  error: string | null;
  refreshSettings: () => void;
  // Contact helper functions
  getFormattedPhone: () => string;
  getWhatsAppPhone: () => string;
  getTelPhone: () => string;
  createWhatsAppUrl: (message?: string) => string;
  createTelUrl: () => string;
  getWhatsAppMessages: () => typeof WHATSAPP_MESSAGES;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const API_BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
      const response = await fetch(`${API_BASE_URL}/api/website-settings`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setSettings(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch settings');
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = () => {
    fetchSettings();
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Helper functions for contact information
  const getFormattedPhone = () => getContactPhone(settings?.contactPhone);
  const getWhatsAppPhone = () => getWhatsAppNumber(settings?.contactPhone);
  const getTelPhone = () => getTelNumber(settings?.contactPhone);
  const createWhatsAppUrl = (message?: string) => createWhatsAppLink(settings?.contactPhone, message);
  const createTelUrl = () => createTelLink(settings?.contactPhone);
  const getWhatsAppMessages = () => WHATSAPP_MESSAGES;

  const value: SettingsContextType = {
    settings,
    loading,
    error,
    refreshSettings,
    getFormattedPhone,
    getWhatsAppPhone,
    getTelPhone,
    createWhatsAppUrl,
    createTelUrl,
    getWhatsAppMessages,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}