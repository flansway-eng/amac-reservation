import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AMAC Bingerville — Fête Mères & Pères | 18 juin 2026',
  icons: { icon: '/logo-amac.png', apple: '/logo-amac.png' },
  description:
    'Réservez votre PASS et pré-commandez votre menu pour la Fête combinée des Mères et des Pères de la Section Café Coton — AMAC Bingerville. Rooftop du Capitol Hôtel, Riviera Golf, Abidjan.',
  openGraph: {
    title: 'AMAC Bingerville — Fête des Mères & des Pères',
    description: 'Jeudi 18 juin 2026 — 18H00 — Rooftop Capitol Hôtel, Riviera Golf, Abidjan',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-halo min-h-full antialiased">{children}</body>
    </html>
  );
}
