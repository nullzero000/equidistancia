import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Otzar Kodesh - Sacred Treasury',
  description: 'Academically validated Kabbalah computation engine',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
