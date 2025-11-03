// utils/themeUtils.ts
export const themes = {
  light: {
    // NỀN TRẮNG, CHỮ ĐEN – TOÀN BỘ
    "--color-bg": "#ffffff",
    "--color-content-bg": "#f9fafb",           // slate-50
    "--color-sidebar-bg": "#ffffff",           // TRẮNG
    "--color-sidebar-text": "#1e293b",          // slate-800
    "--color-sidebar-hover": "#f1f5f9",         // slate-100
    "--color-sidebar-active": "#e2e8f0",        // slate-200
    "--color-sidebar-active-text": "#1e293b",   // slate-800
    "--color-sidebar-border": "#e2e8f0",        // slate-200

    "--color-navbar-bg": "#ffffff",
    "--color-navbar-text": "#1e293b",
    "--color-navbar-border": "#e5e7eb",         // gray-300

    "--color-text-primary": "#1e293b",          // slate-800
    "--color-text-secondary": "#475569",        // slate-700
    "--color-text-muted": "#64748b",            // slate-600

    "--color-primary": "#3b82f6",               // blue-500
    "--color-primary-hover": "#2563eb",         // blue-600
    "--color-tooltip-bg": "#3b82f6",
    "--color-tooltip-text": "#374151",

    "--color-overlay": "rgba(0, 0, 0, 0.4)",
    "--color-ring": "#3b82f6",

    "--color-dropdown-bg": "#ffffff",
    "--color-dropdown-text": "#374151",         // gray-700
    "--color-dropdown-border": "#e5e7eb",       // gray-300

    "--color-danger": "#dc2626",   
    "--color-bell-hover": "#e2e8f0",
  },
  dark: {
    // NỀN TỐI, CHỮ SÁNG – TOÀN BỘ
    "--color-bg": "#0f172a",                    // slate-900
    "--color-content-bg": "#1e293b",            // slate-800
    "--color-sidebar-bg": "#1e293b",            // slate-800
    "--color-sidebar-text": "#f1f5f9",          // slate-100
    "--color-sidebar-hover": "#334155",         // slate-700
    "--color-sidebar-active": "#475569",        // slate-600
    "--color-sidebar-active-text": "#60a5fa",   // blue-400
    "--color-sidebar-border": "#334155",        // slate-700

    "--color-navbar-bg": "#1e293b",             // slate-800
    "--color-navbar-text": "#f1f5f9",           // slate-100
    "--color-navbar-border": "#334155",         // slate-700

    "--color-text-primary": "#f9fafb",          // slate-50
    "--color-text-secondary": "#cbd5e1",        // slate-300
    "--color-text-muted": "#94a3b8",            // slate-400

    "--color-primary": "#60a5fa",               // blue-400
    "--color-primary-hover": "#3b82f6",         // blue-500
    "--color-tooltip-bg": "#3b82f6",
    "--color-tooltip-text": "#f1f5f9",

    "--color-overlay": "rgba(0, 0, 0, 0.75)",
    "--color-ring": "#60a5fa",

    "--color-dropdown-bg": "#1e293b",           // slate-800
    "--color-dropdown-text": "#f1f5f9",         // slate-100
    "--color-dropdown-border": "#334155",       // slate-700

    "--color-danger": "#f87171",                // red-400
    "--color-bell-hover": "#3b82f6",
  },
};

export function applyTheme(theme: "light" | "dark") {
  const root = document.documentElement;
  const selected = themes[theme];
  Object.entries(selected).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}