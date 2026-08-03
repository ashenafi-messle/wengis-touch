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
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
