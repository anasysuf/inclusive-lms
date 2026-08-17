/**
 * =========================================================================
 * UTILITAS AKSESIBILITAS & WCAG 2.1 LEVEL AA (BAHASA INDONESIA)
 * =========================================================================
 * Perhitungan rasio kontras matematis, validasi teks alternatif (alt-text),
 * dan penghitungan akomodasi waktu ujian khusus.
 */

/**
 * Menghitung luminansi relatif untuk komponen warna sRGB.
 * Definisi WCAG 2.1: https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Menghitung rasio kontras antara dua warna RGB.
 * Rumus WCAG: (L1 + 0.05) / (L2 + 0.05) di mana L1 adalah warna lebih terang.
 */
export function calculateContrastRatio(
  rgb1: [number, number, number],
  rgb2: [number, number, number]
): number {
  const lum1 = getLuminance(...rgb1);
  const lum2 = getLuminance(...rgb2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Memeriksa apakah rasio kontras memenuhi WCAG 2.1 AA (4.5:1 teks normal, 3:1 teks besar).
 */
export function meetsWCAG_AA(ratio: number, isLargeText = false): boolean {
  return isLargeText ? ratio >= 3.0 : ratio >= 4.5;
}

/**
 * Memvalidasi teks alternatif (alt-text) berdasarkan standar WCAG 1.1.1 (Konten Non-Teks).
 */
export function validateAltText(altText: string): {
  isValid: boolean;
  reason?: string;
} {
  const trimmed = altText.trim().toLowerCase();
  const forbiddenWords = [
    'gambar',
    'foto',
    'lukisan',
    'tangkapan layar',
    'skrinsot',
    'file',
    'berkas',
    'ikon',
    'grafis',
    'image',
    'photo',
    'picture',
    'screenshot',
  ];

  if (!trimmed) {
    return { isValid: false, reason: 'Teks alternatif tidak boleh kosong untuk gambar informatif.' };
  }

  if (trimmed.length < 8) {
    return { isValid: false, reason: 'Teks alternatif harus minimal 8 karakter.' };
  }

  if (
    forbiddenWords.includes(trimmed) ||
    forbiddenWords.some((w) => trimmed === `sebuah ${w}` || trimmed === `suatu ${w}` || trimmed === `a ${w}` || trimmed === `an ${w}`)
  ) {
    return {
      isValid: false,
      reason: 'Kata generik seperti "gambar" atau "foto" tidak aksesibel. Mohon deskripsikan isi gambar.',
    };
  }

  return { isValid: true };
}

/**
 * Menghitung waktu ujian yang disesuaikan untuk peserta didik dengan akomodasi khusus.
 */
export function computeAccommodatedTime(baseSeconds: number, multiplier = 1.5): number {
  return Math.round(baseSeconds * Math.max(1.0, multiplier));
}
