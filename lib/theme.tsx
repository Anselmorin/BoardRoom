"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ColorMode = "light" | "dark";
export type FontStyle = "clean" | "handwriting";

export interface ThemeSettings {
  colorMode: ColorMode;
  fontStyle: FontStyle;
}

interface ThemeContextType {
  theme: ThemeSettings;
  setColorMode: (mode: ColorMode) => void;
  setFontStyle: (style: FontStyle) => void;
  noteFont: string;
}

const THEME_KEY = "famplan_theme";

const defaults: ThemeSettings = {
  colorMode: "light",
  fontStyle: "clean",
};

const ThemeContext = createContext<ThemeContextType>({
  theme: defaults,
  setColorMode: () => {},
  setFontStyle: () => {},
  noteFont: "",
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeSettings>(defaults);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) {
      try {
        setTheme({ ...defaults, ...JSON.parse(saved) });
      } catch {}
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(THEME_KEY, JSON.stringify(theme));

    // Apply dark mode class to html
    if (theme.colorMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme, mounted]);

  const setColorMode = (mode: ColorMode) =>
    setTheme((t) => ({ ...t, colorMode: mode }));

  const setFontStyle = (style: FontStyle) =>
    setTheme((t) => ({ ...t, fontStyle: style }));

  const noteFont =
    theme.fontStyle === "handwriting"
      ? "'Caveat', cursive"
      : "inherit";

  return (
    <ThemeContext.Provider value={{ theme, setColorMode, setFontStyle, noteFont }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
