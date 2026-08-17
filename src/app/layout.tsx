import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SessionWrapper } from '@/components/providers/SessionWrapper';
import { AccessibilityProvider } from '@/context/AccessibilityContext';
import { SkipLink } from '@/components/a11y/SkipLink';
import { ScreenReaderAnnouncer } from '@/components/a11y/ScreenReaderAnnouncer';
import { ReadingRuler } from '@/components/a11y/ReadingRuler';
import { AccessibilityToolbar } from '@/components/a11y/AccessibilityToolbar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: {
    default: 'AccessiLearn | Platform Pembelajaran Inklusif & Aksesibel',
    template: '%s | AccessiLearn',
  },
  description:
    'Platform e-learning sistem tertutup ramah disabilitas dan sesuai standar WCAG 2.1 Level AA yang dirancang berlandaskan keilmuan Pendidikan Luar Biasa (PLB) dan Universal Design for Learning (UDL).',
  keywords: [
    'AccessiLearn',
    'E-Learning Inklusif',
    'Pendidikan Luar Biasa',
    'WCAG 2.1 AA',
    'Universal Design for Learning',
    'Disleksia',
    'ADHD',
    'Aksesibilitas Web',
  ],
  authors: [{ name: 'AccessiLearn Special Education Team' }],
  creator: 'AccessiLearn',
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#7c3aed',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // Izinkan zoom hingga 500% demi aksesibilitas WCAG 1.4.4
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased selection:bg-primary/20 selection:text-primary">
        <SessionWrapper>
          <AccessibilityProvider>
            {/* 1. Tautan Lompat Navigasi (WCAG 2.4.1) */}
            <SkipLink />

            {/* 2. Wilayah Live ARIA untuk Pembaruan Dinamis Pembaca Layar */}
            <ScreenReaderAnnouncer />

            {/* 3. Penggaris Fokus Membaca untuk Bantuan Pelacakan Baris Visual */}
            <ReadingRuler />

            {/* 4. Header & Navigasi Semantik */}
            <Navbar />

            {/* 5. Konten Landmark Utama */}
            <div className="flex-1 flex flex-col">{children}</div>

            {/* 6. Footer Semantik */}
            <Footer />

            {/* 7. Panel Aksesibilitas Melayang */}
            <AccessibilityToolbar />
          </AccessibilityProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
