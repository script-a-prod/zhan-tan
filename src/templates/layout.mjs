import { esc, join, icons, mark } from './util.mjs';

export function layout({ site, alt, path, altPath, title, description, body, bodyClass = '', ogImage, noindex = false, siteUrl, version, jsonLd, extraHead = '' }) {
  const t = site;
  const canonical = `${siteUrl}${path}`;
  const kkPath = t.lang === 'kk' ? path : altPath;
  const ruPath = t.lang === 'ru' ? path : altPath;
  const og = ogImage || `${siteUrl}/assets/media/logo-512.png`;
  const ld = jsonLd || {
    '@context': 'https://schema.org',
    '@type': 'HealthAndBeautyBusiness',
    name: t.siteName,
    alternateName: 'ЖТСО',
    url: siteUrl,
    logo: `${siteUrl}/assets/media/logo-512.png`,
    telephone: '+77477998900',
    email: t.contacts.email,
    address: { '@type': 'PostalAddress', streetAddress: 'ул. Набережная, 1/7', addressLocality: 'Талгар', addressRegion: 'Алматинская область', addressCountry: 'KZ' },
    sameAs: [t.contacts.instagram, t.contacts.youtube, t.contacts.tiktok, t.contacts.telegram],
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', ratingCount: '264', reviewCount: '132' }
  };
  return `<!DOCTYPE html>
<html lang="${t.htmlLang}" data-lang="${t.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">' : '<meta name="robots" content="index, follow">'}
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="kk" href="${siteUrl}${kkPath}">
<link rel="alternate" hreflang="ru" href="${siteUrl}${ruPath}">
<link rel="alternate" hreflang="x-default" href="${siteUrl}${kkPath}">
<meta property="og:type" content="website">
<meta property="og:locale" content="${t.locale}">
<meta property="og:site_name" content="${esc(t.siteName)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${og}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#f6f1e8">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/media/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/assets/media/favicon-16.png">
<link rel="apple-touch-icon" href="/assets/media/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/piazzolla-cyrillic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/golos-cyrillic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/fonts.css">
<link rel="stylesheet" href="/css/main.css?v=${version}">
${extraHead}
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body class="${bodyClass}">
<a class="skip" href="#main">${t.lang === 'kk' ? 'Мазмұнға өту' : 'К содержимому'}</a>
<header class="site-header" id="top">
  <div class="wrap header-inner">
    <a class="brand" href="${t.dir}/" aria-label="${esc(t.shortName)}">
      ${mark()}
      <span class="brand-name"><span class="brand-a">Жан</span><span class="brand-b">Тән</span></span>
      <span class="brand-sub">${t.lang === 'kk' ? 'сауықтыру орталығы' : 'оздоровительный центр'}</span>
    </a>
    <nav class="site-nav" aria-label="${t.lang === 'kk' ? 'Негізгі мәзір' : 'Основное меню'}">
      ${join(t.nav, (n) => `<a href="${n.href.startsWith('#') ? `${t.dir}/${n.href}` : n.href}">${esc(n.label)}</a>`)}
    </nav>
    <div class="header-actions">
      <a class="lang" href="${altPath}" hreflang="${alt.lang}" lang="${alt.lang}" aria-label="${alt.lang === 'ru' ? 'Русская версия' : 'Қазақша нұсқасы'}"><span class="is-on">${t.selfLabel}</span><span class="sep">/</span><span>${t.altLabel}</span></a>
      <a class="btn btn-primary btn-sm" href="${t.contacts.whatsappHref}" target="_blank" rel="noopener">${icons.whatsapp}<span>WhatsApp</span></a>
      <button class="burger" aria-label="${t.lang === 'kk' ? 'Мәзір' : 'Меню'}" aria-expanded="false" aria-controls="mobile-nav"><span></span><span></span></button>
    </div>
  </div>
  <div class="mobile-nav" id="mobile-nav" hidden>
    ${join(t.nav, (n) => `<a href="${n.href.startsWith('#') ? `${t.dir}/${n.href}` : n.href}">${esc(n.label)}</a>`)}
    <a class="lang-mobile" href="${altPath}" hreflang="${alt.lang}">${alt.lang === 'ru' ? 'Русский' : 'Қазақша'}</a>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="footer-brand">
      ${mark('mark-lg')}
      <p class="footer-tagline">${esc(t.tagline)}</p>
      <p class="footer-note">${esc(t.footer.text)}</p>
    </div>
    <div class="footer-col">
      <h4>${t.lang === 'kk' ? 'Бөлімдер' : 'Разделы'}</h4>
      ${join(t.nav, (n) => `<a href="${n.href.startsWith('#') ? `${t.dir}/${n.href}` : n.href}">${esc(n.label)}</a>`)}
    </div>
    <div class="footer-col">
      <h4>${t.lang === 'kk' ? 'Байланыс' : 'Контакты'}</h4>
      <a href="${t.contacts.phoneHref}">${t.contacts.phone}</a>
      <a href="${t.contacts.whatsappHref}" target="_blank" rel="noopener">WhatsApp ${t.contacts.whatsapp}</a>
      <a href="mailto:${t.contacts.email}">${t.contacts.email}</a>
      <a href="${t.contacts.instagram}" target="_blank" rel="noopener">Instagram</a>
      <a href="${t.contacts.youtube}" target="_blank" rel="noopener">YouTube</a>
    </div>
    <div class="footer-col">
      <h4>${t.lang === 'kk' ? 'Құжаттар' : 'Документы'}</h4>
      ${join(t.footer.legal, (l) => `<a href="${l.href}">${esc(l.label)}</a>`)}
      <a href="${altPath}" hreflang="${alt.lang}">${alt.lang === 'ru' ? 'Русская версия' : 'Қазақша нұсқасы'}</a>
    </div>
  </div>
  <div class="wrap footer-bottom">
    <span>${esc(t.footer.copy)}</span>
    <a href="#top" class="to-top">${t.lang === 'kk' ? 'Жоғары' : 'Наверх'} ↑</a>
  </div>
</footer>

<div class="chat" id="chat" data-lang="${t.lang}" data-kb="/data/kb.${t.lang}.json">
  <button class="chat-fab" id="chat-fab" aria-expanded="false" aria-controls="chat-panel">
    <span class="chat-fab-icon">${icons.chat}</span>
    <span class="chat-fab-label">${esc(t.chat.button)}</span>
  </button>
  <div class="chat-panel" id="chat-panel" role="dialog" hidden aria-label="${esc(t.chat.title)}">
    <header class="chat-head">
      ${mark()}
      <div class="chat-head-text">
        <strong>${esc(t.chat.title)}</strong>
        <span class="chat-status"><i></i>${esc(t.chat.status)}</span>
      </div>
      <button class="chat-reset icon-btn" id="chat-reset" title="${esc(t.chat.reset)}" aria-label="${esc(t.chat.reset)}">↺</button>
      <button class="chat-close icon-btn" id="chat-close" aria-label="${esc(t.chat.close)}">${icons.close}</button>
    </header>
    <div class="chat-log" id="chat-log" aria-live="polite"></div>
    <div class="chat-suggest" id="chat-suggest"></div>
    <form class="chat-form" id="chat-form" autocomplete="off">
      <input id="chat-input" type="text" placeholder="${esc(t.chat.placeholder)}" maxlength="300" required>
      <button type="submit" class="chat-send" aria-label="${esc(t.chat.send)}">${icons.send}</button>
    </form>
    <p class="chat-disclaimer">${esc(t.chat.disclaimer)}</p>
  </div>
</div>
<script type="module" src="/js/main.js?v=${version}"></script>
<script type="module" src="/js/chat-widget.js?v=${version}"></script>
</body>
</html>`;
}
