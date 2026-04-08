import type { Metadata } from "next";
import { ThemeProvider } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "BoardRoom",
  description: "Digital family sticky note board",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-amber-50 dark:bg-stone-900 text-stone-800 dark:text-stone-200 antialiased min-h-screen transition-colors">
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            const t = JSON.parse(localStorage.getItem('famplan_theme') || '{}');
            if (t.colorMode === 'dark') document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
          } catch(e) {}
        ` }} />
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
