import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface AccessibilitySettings {
  highContrast: boolean;
  fontScale: number;
  reducedMotion: boolean;
  animationsEnabled: boolean;
  focusOutlines: boolean;
  notifications: boolean;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  fontScale: 1,
  reducedMotion: false,
  animationsEnabled: true,
  focusOutlines: true,
  notifications: true,
};

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void;
  resetSettings: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const stored = localStorage.getItem("ids-accessibility");
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem("ids-accessibility", JSON.stringify(settings));
    const root = document.documentElement;
    root.style.fontSize = `${settings.fontScale * 100}%`;
    root.classList.toggle("high-contrast", settings.highContrast);
    root.classList.toggle("reduce-motion", settings.reducedMotion || !settings.animationsEnabled);
    root.classList.toggle("focus-visible-outlines", settings.focusOutlines);
  }, [settings]);

  const updateSetting = <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem("ids-accessibility");
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return ctx;
}
