import type { Metadata } from 'next';
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
  title: 'AccessiLearn | Platform Pembelajaran Inklusif & Aksesibel (Sistem Tertutup)',
  description:
    'Platform e-learning sistem tertutup ramah disabilitas dan sesuai standar WCAG 2.1 Level AA yang dirancang berlandaskan keilmuan Pendidikan Luar Biasa (PLB) dan Universal Design for Learning (UDL).',
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
