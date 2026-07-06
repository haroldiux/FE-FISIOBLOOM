import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

export interface TenantSettings {
  features: {
    multiBranch: boolean;
    inventory: boolean;
    portalPaciente: boolean;
  };
  branding: {
    primaryColor: string;
    logoUrl?: string;
  };
  contactInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  whatsapp?: {
    enabled: boolean;
    retouchReminders: boolean;
    anticipationHours: 24 | 48 | 2;
    senderName: string;
    apiToken: string;
    phoneNumberId: string;
    messageTemplate: string;
  };
}

const defaultSettings: TenantSettings = {
  features: {
    multiBranch: false,
    inventory: false,
    portalPaciente: false,
  },
  branding: {
    primaryColor: '#ec4899', // Pink default
  },
  contactInfo: {
    name: '',
    address: '',
    phone: '',
    email: '',
  },
  whatsapp: {
    enabled: true,
    retouchReminders: true,
    anticipationHours: 24,
    senderName: 'Centro Estético',
    apiToken: '',
    phoneNumberId: '',
    messageTemplate: 'Hola {{nombre_paciente}}, te recordamos tu cita de {{servicio}} con {{profesional}} mañana a las {{hora_cita}}. ¡Te esperamos!',
  },
};

interface TenantSettingsContextType {
  settings: TenantSettings;
  loading: boolean;
  updateSettings: (newSettings: Partial<TenantSettings>) => Promise<void>;
}

const TenantSettingsContext = createContext<TenantSettingsContextType | undefined>(undefined);

export const TenantSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<TenantSettings>(() => {
    // Try to restore cached settings first
    try {
      const cached = localStorage.getItem('tenant_settings');
      return cached ? JSON.parse(cached) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });
  const [loading, setLoading] = useState(true);

  const applyBranding = (color: string) => {
    if (!color) return;
    document.documentElement.style.setProperty('--primary', color);
    // Set a matching ring/focus shade with opacity
    document.documentElement.style.setProperty('--ring', `${color}33`);
  };

  const sanitizeSettingsForCache = (data: TenantSettings): TenantSettings => {
    const sanitized = JSON.parse(JSON.stringify(data));
    if (sanitized.whatsapp) {
      delete sanitized.whatsapp.apiToken;
    }
    return sanitized;
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tenant/settings');
      const data = res.data || defaultSettings;
      setSettings(data);
      localStorage.setItem('tenant_settings', JSON.stringify(sanitizeSettingsForCache(data)));
      applyBranding(data.branding.primaryColor);
    } catch (err) {
      console.error('Error fetching tenant settings:', err);
      // Keep cached settings as fallback
      applyBranding(settings.branding.primaryColor);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSettings();
    } else {
      // Revert to default branding on logout
      setSettings(defaultSettings);
      localStorage.removeItem('tenant_settings');
      applyBranding(defaultSettings.branding.primaryColor);
      setLoading(false);
    }
  }, [user]);

  const updateSettings = async (newSettings: Partial<TenantSettings>) => {
    try {
      const res = await api.put('/tenant/settings', newSettings);
      const data = res.data;
      setSettings(data);
      localStorage.setItem('tenant_settings', JSON.stringify(sanitizeSettingsForCache(data)));
      applyBranding(data.branding.primaryColor);
    } catch (err) {
      console.error('Error updating tenant settings:', err);
      throw err;
    }
  };

  return (
    <TenantSettingsContext.Provider value={{ settings, loading, updateSettings }}>
      {children}
    </TenantSettingsContext.Provider>
  );
};

export const useTenantSettings = () => {
  const context = useContext(TenantSettingsContext);
  if (!context) {
    throw new Error('useTenantSettings must be used within a TenantSettingsProvider');
  }
  return context;
};
