import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/src/context/LanguageContext';

export const metadata: Metadata = {
  title: "Wengi's Touch - Luxury Handcrafted Crochet",
  description: 'Premium handcrafted crochet garments, bags, and accessories made with organic materials.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to Cloudinary CDN for instant TLS handshake and faster first image delivery */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
