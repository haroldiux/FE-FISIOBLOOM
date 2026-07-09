import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { applyPalette, DEFAULT_PALETTE, resolvePaletteKey } from '../lib/palettes';

export interface TenantSettings {
  features: {
    multiBranch: boolean;
    inventory: boolean;
    portalPaciente: boolean;
  };
  branding: {
    primaryColor: string;
    /**
     * Identifier of the Spatial UI brand palette applied to the tenant.
     * One of: "aura" | "bloom" | "ocean" | "sunset" | "berry" | "tropical".
     * Defaults to "aura" when the backend does not provide it.
     */
    palette?: string;
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
    palette: DEFAULT_PALETTE,
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
      if (cached) {
        const parsed = JSON.parse(cached) as TenantSettings;
        // Migrate older cached payloads that pre-date the palette field.
        if (!parsed.branding) {
          parsed.branding = { ...defaultSettings.branding };
        }
        if (!parsed.branding.palette) {
          parsed.branding.palette = DEFAULT_PALETTE;
        }
        return parsed;
      }
    } catch {
      // fall through to defaults
    }
    return defaultSettings;
  });
  const [loading, setLoading] = useState(true);

  /**
   * Pushes the active palette + primary color into the document root.
   *
   * Order matters: we always resolve the palette FIRST so that the brand
   * tokens (--primary-glow, --success, --warning, --error, etc.) are in
   * place. The tenant-specific primary color and matching focus ring are
   * then written as inline custom properties, intentionally overriding
   * the palette's default so admins can still pick a custom brand hue.
   */
  const applyBranding = (paletteKey: string | undefined, color: string) => {
    applyPalette(resolvePaletteKey(paletteKey));
    if (color) {
      // Set a matching ring/focus shade with opacity
      document.documentElement.style.setProperty('--ring', `${color}33`);
    }
  };

  const sanitizeSettingsForCache = (data: TenantSettings): TenantSettings => {
    const sanitized = JSON.parse(JSON.stringify(data));
    if (sanitized.whatsapp) {
      delete sanitized.whatsapp.apiToken;
    }
    // Make sure a cached payload always carries a palette key so the next
    // page load can re-apply it without a server roundtrip.
    if (!sanitized.branding) {
      sanitized.branding = { ...defaultSettings.branding };
    }
    sanitized.branding.palette = resolvePaletteKey(sanitized.branding.palette);
    return sanitized;
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get<any>('/tenant/settings');
      console.log('fetchSettings response raw:', res);
      const data = res?.branding ? res : (res?.data || defaultSettings);
      console.log('fetchSettings data parsed:', data);
      const normalized: TenantSettings = {
        ...data,
        branding: {
          ...defaultSettings.branding,
          ...(data.branding || {}),
          palette: resolvePaletteKey(data.branding?.palette),
        },
      };
      setSettings(normalized);
      localStorage.setItem('tenant_settings', JSON.stringify(sanitizeSettingsForCache(normalized)));
      applyBranding(normalized.branding.palette, normalized.branding.primaryColor);
    } catch (err) {
      console.error('Error fetching tenant settings:', err);
      // Keep cached settings as fallback
      applyBranding(settings.branding.palette, settings.branding.primaryColor);
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
      applyBranding(defaultSettings.branding.palette, defaultSettings.branding.primaryColor);
      setLoading(false);
    }
  }, [user]);

  const updateSettings = async (newSettings: Partial<TenantSettings>) => {
    try {
      const res = await api.put<any>('/tenant/settings', newSettings);
      console.log('updateSettings response raw:', res);
      const data = res?.branding ? res : res?.data;
      console.log('updateSettings data parsed:', data);
      if (!data || !data.branding) {
        throw new Error("La respuesta del servidor no contiene la configuración de marca (branding).");
      }
      const normalized: TenantSettings = {
        ...data,
        branding: {
          ...defaultSettings.branding,
          ...(data.branding || {}),
          palette: resolvePaletteKey(data.branding?.palette),
        },
      };
      setSettings(normalized);
      localStorage.setItem('tenant_settings', JSON.stringify(sanitizeSettingsForCache(normalized)));
      applyBranding(normalized.branding.palette, normalized.branding.primaryColor);
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
