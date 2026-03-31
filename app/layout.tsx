import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f4e7d8"
};

export const metadata: Metadata = {
  title: "ACA Tizenkét Lépés",
  description:
    "Warm, focused ACA companion app for learning, practicing, and recording the 12 steps with AI support.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ACA Tizenkét Lépés"
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    apple: "/apple-icon.svg",
    icon: [
      {
        url: "/icon.svg",
        type: "image/svg+xml"
      }
    ]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu">
      <body className="font-body text-ink antialiased">
        {children}
        <PwaInstallPrompt />
      </body>
    </html>
  );
}
