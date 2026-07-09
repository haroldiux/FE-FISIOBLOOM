/**
 * Spatial UI — 6-color palette system
 *
 * Each palette exposes the brand tokens used by the design system (primary,
 * secondary, success, warning, error and their glow variants) and the dark
 * page/surface backgrounds that pair with it. The application applies the
 * active palette by adding a class on the document root (`.palette-aura`,
 * `.palette-bloom`, …) and letting `theme.css` resolve the actual CSS
 * variables.
 *
 * `applyPalette` also exposes a JS fallback that writes the palette tokens
 * as inline custom properties. This is required because some flows (for
 * instance the tenant primary color) override `--primary`/`--ring` inline
 * and we want the rest of the brand tokens to be authoritative even when
 * the stylesheet hasn't loaded yet.
 */

export type PaletteKey =
  | "aura"
  | "bloom"
  | "ocean"
  | "sunset"
  | "berry"
  | "tropical";

export interface PaletteDefinition {
  /** URL-friendly identifier, used as the class suffix (`palette-<key>`). */
  key: PaletteKey;
  /** Display name. */
  name: string;
  /** Short marketing description shown in the configurator. */
  description: string;
  /** Brand tokens (HEX, except `*Glow` which is a rgba string). */
  tokens: {
    primary: string;
    primaryGlow: string;
    secondary: string;
    secondaryGlow: string;
    success: string;
    successGlow: string;
    warning: string;
    warningGlow: string;
    error: string;
    errorGlow: string;
  };
  /** Dark-mode page/surface background colors. */
  dark: {
    bgPage: string;
    bgSurface: string;
    bgSurfaceElevated: string;
  };
}

/**
 * Source of truth for the 6 Spatial UI palettes. The values are kept
 * identical to `design_system_variables.json` so that the marketing
 * preview and the runtime app can never drift apart.
 */
export const PALETTES: Record<PaletteKey, PaletteDefinition> = {
  aura: {
    key: "aura",
    name: "Aura",
    description: "Teal + Violet. Calma, higiene, bienestar.",
    tokens: {
      primary: "#2DD4BF",
      primaryGlow: "rgba(45, 212, 191, 0.45)",
      secondary: "#A78BFA",
      secondaryGlow: "rgba(167, 139, 250, 0.40)",
      success: "#34D399",
      successGlow: "rgba(52, 211, 153, 0.40)",
      warning: "#FBBF24",
      warningGlow: "rgba(251, 191, 36, 0.40)",
      error: "#FB7185",
      errorGlow: "rgba(251, 113, 133, 0.40)",
    },
    dark: {
      bgPage: "#030712",
      bgSurface: "rgba(17, 24, 39, 0.55)",
      bgSurfaceElevated: "rgba(55, 65, 81, 0.50)",
    },
  },
  bloom: {
    key: "bloom",
    name: "Bloom",
    description: "Pink + Mauve. Suave, femenino, estética.",
    tokens: {
      primary: "#F472B6",
      primaryGlow: "rgba(244, 114, 182, 0.45)",
      secondary: "#C084FC",
      secondaryGlow: "rgba(192, 132, 252, 0.40)",
      success: "#34D399",
      successGlow: "rgba(52, 211, 153, 0.40)",
      warning: "#FBBF24",
      warningGlow: "rgba(251, 191, 36, 0.40)",
      error: "#FB7185",
      errorGlow: "rgba(251, 113, 133, 0.40)",
    },
    dark: {
      bgPage: "#1A1016",
      bgSurface: "rgba(45, 30, 40, 0.58)",
      bgSurfaceElevated: "rgba(70, 45, 60, 0.55)",
    },
  },
  ocean: {
    key: "ocean",
    name: "Ocean",
    description: "Cyan + Coral. Fresco, marino, energético.",
    tokens: {
      primary: "#22D3EE",
      primaryGlow: "rgba(34, 211, 238, 0.45)",
      secondary: "#FB923C",
      secondaryGlow: "rgba(251, 146, 60, 0.40)",
      success: "#34D399",
      successGlow: "rgba(52, 211, 153, 0.40)",
      warning: "#FDE047",
      warningGlow: "rgba(253, 224, 71, 0.40)",
      error: "#F87171",
      errorGlow: "rgba(248, 113, 113, 0.40)",
    },
    dark: {
      bgPage: "#02101A",
      bgSurface: "rgba(8, 30, 45, 0.58)",
      bgSurfaceElevated: "rgba(15, 50, 70, 0.55)",
    },
  },
  sunset: {
    key: "sunset",
    name: "Sunset",
    description: "Peach + Lavender. Cálido, relajado, atardecer.",
    tokens: {
      primary: "#FDBA74",
      primaryGlow: "rgba(253, 186, 116, 0.45)",
      secondary: "#C4B5FD",
      secondaryGlow: "rgba(196, 181, 253, 0.40)",
      success: "#34D399",
      successGlow: "rgba(52, 211, 153, 0.40)",
      warning: "#FCD34D",
      warningGlow: "rgba(252, 211, 77, 0.40)",
      error: "#FCA5A5",
      errorGlow: "rgba(252, 165, 165, 0.40)",
    },
    dark: {
      bgPage: "#0F172A",
      bgSurface: "rgba(30, 41, 59, 0.58)",
      bgSurfaceElevated: "rgba(51, 65, 85, 0.55)",
    },
  },
  berry: {
    key: "berry",
    name: "Berry",
    description: "Red berry + Plum. Intenso, premium, médico.",
    tokens: {
      primary: "#F87171",
      primaryGlow: "rgba(248, 113, 113, 0.45)",
      secondary: "#E879F9",
      secondaryGlow: "rgba(232, 121, 249, 0.40)",
      success: "#34D399",
      successGlow: "rgba(52, 211, 153, 0.40)",
      warning: "#FBBF24",
      warningGlow: "rgba(251, 191, 36, 0.40)",
      error: "#FB7185",
      errorGlow: "rgba(251, 113, 133, 0.40)",
    },
    dark: {
      bgPage: "#120410",
      bgSurface: "rgba(40, 15, 30, 0.58)",
      bgSurfaceElevated: "rgba(65, 25, 50, 0.55)",
    },
  },
  tropical: {
    key: "tropical",
    name: "Tropical",
    description: "Mango + Fuchsia. Exótico, vibrante, veraniego.",
    tokens: {
      primary: "#FB923C",
      primaryGlow: "rgba(251, 146, 60, 0.45)",
      secondary: "#E879F9",
      secondaryGlow: "rgba(232, 121, 249, 0.40)",
      success: "#34D399",
      successGlow: "rgba(52, 211, 153, 0.40)",
      warning: "#FDE047",
      warningGlow: "rgba(253, 224, 71, 0.40)",
      error: "#FB7185",
      errorGlow: "rgba(251, 113, 133, 0.40)",
    },
    dark: {
      bgPage: "#180828",
      bgSurface: "rgba(40, 20, 55, 0.58)",
      bgSurfaceElevated: "rgba(65, 35, 85, 0.55)",
    },
  },
};

/** Returns the default palette key. Safe to call during SSR/early init. */
export const DEFAULT_PALETTE: PaletteKey = "aura";

/** Ordered list used by selectors — preserves the canonical Spatial UI order. */
export function getPaletteNames(): PaletteKey[] {
  return ["aura", "bloom", "ocean", "sunset", "berry", "tropical"];
}

/**
 * Type guard for arbitrary string values coming from the backend or
 * `localStorage`. Returns `true` when the value matches a known palette.
 */
export function isPaletteKey(value: unknown): value is PaletteKey {
  return typeof value === "string" && value in PALETTES;
}

/**
 * Resolves a palette key, falling back to the default when the input is
 * missing, empty or not a known key.
 */
export function resolvePaletteKey(value: unknown): PaletteKey {
  return isPaletteKey(value) ? value : DEFAULT_PALETTE;
}

/**
 * Removes every known palette class from the supplied element. Useful to
 * keep the class list clean when switching palettes — browsers only need
 * one `.palette-*` active at a time.
 */
function clearPaletteClasses(el: HTMLElement) {
  const classList = Array.from(el.classList);
  for (const cls of classList) {
    if (cls.startsWith("palette-")) {
      el.classList.remove(cls);
    }
  }
}

const PALETTE_CLASS_PREFIX = "palette-";

/**
 * Applies a palette to the document root:
 *
 * 1. Adds the `.palette-<key>` class on `<html>` so the matching block in
 *    `theme.css` overrides the semantic variables.
 * 2. Injects the brand tokens as inline custom properties as a safety net —
 *    that way the variables are always present, even before the stylesheet
 *    is parsed or if a future refactor removes the class-based rules.
 *
 * Note: `--ring` is NOT overwritten here because the focus ring is managed
 * separately by `TenantSettingsContext`.
 */
export function applyPalette(paletteKey: string): PaletteKey {
  const key = resolvePaletteKey(paletteKey);
  const palette = PALETTES[key];

  if (typeof document !== "undefined") {
    const root = document.documentElement;
    clearPaletteClasses(root);
    root.classList.add(`${PALETTE_CLASS_PREFIX}${key}`);

    const style = root.style;
    const { tokens, dark } = palette;
    style.setProperty("--primary", tokens.primary);
    style.setProperty("--primary-glow", tokens.primaryGlow);
    style.setProperty("--secondary", tokens.secondary);
    style.setProperty("--secondary-glow", tokens.secondaryGlow);
    style.setProperty("--success", tokens.success);
    style.setProperty("--success-glow", tokens.successGlow);
    style.setProperty("--warning", tokens.warning);
    style.setProperty("--warning-glow", tokens.warningGlow);
    style.setProperty("--error", tokens.error);
    style.setProperty("--error-glow", tokens.errorGlow);
    style.setProperty("--palette-bg-page", dark.bgPage);
    style.setProperty("--palette-bg-surface", dark.bgSurface);
    style.setProperty("--palette-bg-surface-elevated", dark.bgSurfaceElevated);
    style.setProperty("--palette-name", palette.name);
  }

  return key;
}

/**
 * Convenience helper that strips every palette class and restores the
 * Aura defaults. Used on logout to leave the UI in a clean state.
 */
export function resetPalette() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  clearPaletteClasses(root);
  applyPalette(DEFAULT_PALETTE);
}

/**
 * Pure helper that returns the inline style string used to paint a
 * brand-tinted background with a soft "glow" overlay. Useful for
 * previews inside the configurator cards.
 */
export function paletteSwatchStyle(palette: PaletteDefinition) {
  return {
    background: `linear-gradient(135deg, ${palette.tokens.primary} 0%, ${palette.tokens.secondary} 100%)`,
    boxShadow: `0 8px 24px -8px ${palette.tokens.primaryGlow}`,
  } as const;
}
