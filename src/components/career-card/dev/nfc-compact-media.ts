/** Inline SVG stand-ins for the NFC Compact lab — no image dependencies. */

export const svg = (body: string, w = 400, h = 400) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`,
  )}`;

/** Demo portrait — abstract avatar stand-in. */
export const svgPortrait = svg(`
<defs><linearGradient id="pb" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#dbeafe"/><stop offset="1" stop-color="#bfdbfe"/></linearGradient></defs>
<rect width="400" height="400" fill="url(#pb)"/>
<circle cx="200" cy="160" r="72" fill="#1e3a8a"/>
<path d="M88 400 Q200 268 312 400 Z" fill="#1e3a8a"/>`);

/** Demo company logo — simple navy wordmark tile. */
export const svgLogo = svg(`
<defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#eff6ff"/><stop offset="1" stop-color="#dbeafe"/></linearGradient></defs>
<rect width="400" height="400" rx="48" fill="url(#lg)"/>
<rect x="120" y="120" width="160" height="160" rx="36" fill="#1e3a8a"/>
<text x="200" y="225" font-family="Arial,sans-serif" font-size="96" font-weight="800" fill="#eff6ff" text-anchor="middle">S</text>`);
