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
            style: {
              background: "#0f0f0f",
              color: "#e5e5e5",
              border: "1px solid #2a2a2a",
              padding: "10px 14px",
              fontSize: "14px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            },
            success: {
              iconTheme: {
                primary: "#fb923c",
                secondary: "#0f0f0f",
              },
            },
            error: {
              style: {
                border: "1px solid #ff4d4f",
              },
              iconTheme: {
                primary: "#ff4d4f",
                secondary: "#0f0f0f",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
