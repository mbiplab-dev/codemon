import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "codemon",
  description: "Collaborative Web Based IDE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            // Default style for all toasts
            style: {
              background: "#0f0f0f", // Matches editor background
              color: "#e5e5e5", // Light gray text
              border: "1px solid #2a2a2a", // Subtle border
              padding: "10px 14px",
              fontSize: "14px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            },
            // Success toast style
            success: {
              iconTheme: {
                primary: "#fb923c", // Orange (like your cursor)
                secondary: "#0f0f0f",
              },
            },
            // Error toast style
            error: {
              style: {
                border: "1px solid #ff4d4f",
              },
              iconTheme: {
                primary: "#ff4d4f", // Red for errors
                secondary: "#0f0f0f",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
