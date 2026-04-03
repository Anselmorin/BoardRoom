"use client";

import { useTheme } from "@/lib/theme";

interface ThemePanelProps {
  onClose: () => void;
}

export default function ThemePanel({ onClose }: ThemePanelProps) {
  const { theme, setColorMode, setFontStyle, noteFont } = useTheme();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-stone-800 rounded-2xl shadow-2xl w-full max-w-sm border border-stone-200 dark:border-stone-700 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-5">
            🎨 Themes
          </h2>

          {/* Color Mode */}
          <div className="mb-6">
            <label className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-3 block">
              Color Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setColorMode("light")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  theme.colorMode === "light"
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-500/10"
                    : "border-stone-200 dark:border-stone-600 hover:border-stone-300 dark:hover:border-stone-500"
                }`}
              >
                <div className="text-2xl mb-2">☀️</div>
                <div className="text-sm font-medium text-stone-700 dark:text-stone-300">Light</div>
              </button>
              <button
                onClick={() => setColorMode("dark")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  theme.colorMode === "dark"
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-500/10"
                    : "border-stone-200 dark:border-stone-600 hover:border-stone-300 dark:hover:border-stone-500"
                }`}
              >
                <div className="text-2xl mb-2">🌙</div>
                <div className="text-sm font-medium text-stone-700 dark:text-stone-300">Dark</div>
              </button>
            </div>
          </div>

          {/* Font Style */}
          <div>
            <label className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-3 block">
              Note Font
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFontStyle("clean")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  theme.fontStyle === "clean"
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-500/10"
                    : "border-stone-200 dark:border-stone-600 hover:border-stone-300 dark:hover:border-stone-500"
                }`}
              >
                <div className="text-lg mb-1 text-stone-700 dark:text-stone-300">Aa</div>
                <div className="text-sm font-medium text-stone-700 dark:text-stone-300">Clean</div>
              </button>
              <button
                onClick={() => setFontStyle("handwriting")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  theme.fontStyle === "handwriting"
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-500/10"
                    : "border-stone-200 dark:border-stone-600 hover:border-stone-300 dark:hover:border-stone-500"
                }`}
              >
                <div className="text-lg mb-1 text-stone-700 dark:text-stone-300" style={{ fontFamily: "'Caveat', cursive" }}>Aa</div>
                <div className="text-sm font-medium text-stone-700 dark:text-stone-300">Handwriting</div>
              </button>
            </div>

            {/* Preview */}
            <div className="mt-4 p-3 rounded-lg bg-stone-100 dark:bg-stone-700 border border-stone-200 dark:border-stone-600">
              <p className="text-xs text-stone-400 mb-1">Preview:</p>
              <p
                className="text-stone-700 dark:text-stone-300"
                style={{
                  fontFamily: noteFont,
                  fontSize: theme.fontStyle === "handwriting" ? "1.25rem" : "0.875rem",
                }}
              >
                Don&apos;t forget to take out the trash! 🗑️
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-stone-200 dark:border-stone-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium bg-amber-500 text-stone-900 rounded-lg hover:bg-amber-400 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
