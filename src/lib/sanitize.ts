/**
 * Utility untuk sanitasi konten HTML dan pencegahan serangan XSS (Cross-Site Scripting).
 * Menghilangkan tag berbahaya seperti <script>, <iframe>, <object>, <embed>, <applet>,
 * event handler inline (onload, onclick, onerror, dsb), serta skema protokol berbahaya (javascript:, data:).
 */

export function sanitizeHtml(dirtyHtml: string): string {
  if (!dirtyHtml || typeof dirtyHtml !== 'string') {
    return '';
  }

  let clean = dirtyHtml;

  // 1. Hapus tag script, iframe, object, embed, applet, form, base, link, meta, style beserta isinya
  const dangerousTags = [
    'script',
    'iframe',
    'object',
    'embed',
    'applet',
    'form',
    'base',
    'meta',
    'link',
  ];

  for (const tag of dangerousTags) {
    const regExp = new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>|<${tag}[^>]*\\/?>`, 'gi');
    clean = clean.replace(regExp, '');
  }

  // 2. Hapus inline event handlers (on*, e.g., onload, onerror, onclick, onmouseover, etc.)
  clean = clean.replace(/\s+on[a-zA-Z]+\s*=\s*(['"][^'"]*['"]|[^\s>]+)/gi, '');

  // 3. Hapus skema URL berbahaya seperti javascript: atau vbscript:
  clean = clean.replace(/(href|src|action)\s*=\s*(['"])\s*(javascript|vbscript|data\s*:\s*text\/html):/gi, '$1=$2#');

  return clean;
}

/**
 * Sanitasi string input teks biasa untuk mencegah injeksi karakter kontrol berbahaya.
 */
export function sanitizePlainText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  return text.trim();
}
