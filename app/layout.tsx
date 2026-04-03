import type { Metadata } from "next";
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
      <body className="bg-amber-50 text-stone-800 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
