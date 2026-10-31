import { esc, join, icons } from './util.mjs';
import { fmtDate } from './home.mjs';

function renderBlocks(blocks, lang) {
  // group consecutive images into a gallery
  const grouped = [];
  for (const b of blocks) {
    const last = grouped[grouped.length - 1];
    if (b.type === 'img' && last && last.type === 'gallery') last.items.push(b);
    else if (b.type === 'img') grouped.push({ type: 'gallery', items: [b] });
    else grouped.push(b);
  }
  return grouped.map((b) => {
    if (b.type === 'gallery' && b.items.length === 1) b = b.items[0];
    switch (b.type) {
      case 'h2': return `<h2>${esc(b.text)}</h2>`;
      case 'h3': return `<h3>${esc(b.text)}</h3>`;
      case 'p': return `<p>${sanitize(b.html)}</p>`;
      case 'ul': return `<ul>${join(b.items, (i) => `<li>${sanitize(i)}</li>`)}</ul>`;
      case 'ol': return `<ol>${join(b.items, (i) => `<li>${sanitize(i)}</li>`)}</ol>`;
      case 'gallery': return `<div class="art-gallery">${join(b.items, (i) => `<figure class="art-fig"><img src="/${i.src}" alt="${esc(i.alt || '')}" loading="lazy">${i.caption ? `<figcaption>${esc(i.caption)}</figcaption>` : ''}</figure>`)}</div>`;
      case 'img': return `<figure class="art-fig"><img src="/${b.src}" alt="${esc(b.alt || '')}" loading="lazy">${b.caption ? `<figcaption>${esc(b.caption)}</figcaption>` : ''}</figure>`;
      case 'youtube': return `<figure class="art-video"><button class="yt-thumb" data-yt="${esc(b.id)}" aria-label="${esc(b.caption || 'YouTube')}"><img src="https://i.ytimg.com/vi/${esc(b.id)}/hqdefault.jpg" alt="" loading="lazy" width="480" height="360"><span class="play-badge">${icons.play}</span></button>${b.caption ? `<figcaption>${esc(b.caption)}</figcaption>` : ''}</figure>`;
      case 'callout': return `<aside class="callout">${icons.leaf}<div>${sanitize(b.html)}</div></aside>`;
      default: return '';
    }
  }).join('\n');
}
// allow only <strong>, <em>, <a href="…">, <br>
function sanitize(html = '') {
  return esc(html)
    .replace(/&lt;(\/?)(strong|em|b|i|br)&gt;/g, '<$1$2>')
    .replace(/&lt;a href=&quot;(https?:\/\/[^&]+|\/[^&]*)&quot;[^&]*&gt;/g, '<a href="$1" target="_blank" rel="noopener">')
    .replace(/&lt;\/a&gt;/g, '</a>');
}

export function blogIndexPage({ site: t, articles }) {
  const body = `
<section class="page-head">
  <div class="wrap">
    <p class="eyebrow reveal">${esc(t.blog.eyebrow)}</p>
    <h1 class="display reveal">${esc(t.blog.indexTitle.replace(/ — .*$/, ''))}</h1>
    <p class="lead reveal">${esc(t.blog.lead)}</p>
  </div>
</section>
<section class="blog-list">
  <div class="wrap">
    <ul class="post-grid post-grid-full">
      ${join(articles, (a, i) => `<li class="post reveal" style="--i:${i}"><a href="${t.dir}/blog/${a.slug}/">
        <figure><img src="/${a.cover}" alt="" loading="lazy"></figure>
        <div class="post-body"><time datetime="${a.date}">${fmtDate(a.date, t.lang)}</time><h2 class="h3">${esc(a.title)}</h2><p>${esc(a.excerpt)}</p><span class="muted">${a.readingMinutes} ${esc(t.cta.readMin)}</span></div>
      </a></li>`)}
    </ul>
  </div>
</section>`;
  return { title: t.blog.indexTitle, description: t.blog.indexDescription, bodyClass: 'page-blog', body };
}

export function articlePage({ site: t, article: a, articles }) {
  const others = articles.filter((x) => x.slug !== a.slug).slice(0, 3);
  const body = `
<article class="article">
  <header class="article-head">
    <div class="wrap narrow">
      <a class="crumb" href="${t.dir}/blog/">← ${t.lang === 'kk' ? 'Блог' : 'Блог'}</a>
      <h1 class="display-2 reveal">${esc(a.title)}</h1>
      <p class="lead reveal">${esc(a.excerpt)}</p>
      <p class="article-meta reveal"><time datetime="${a.date}">${fmtDate(a.date, t.lang)}</time> · ${a.readingMinutes} ${esc(t.cta.readMin)}${a.tags && a.tags.length ? ' · ' + a.tags.map(esc).join(', ') : ''}</p>
    </div>
    <figure class="article-cover reveal${a.cover.includes('/img/') ? ' is-photo' : ''}"><img src="/${a.cover}" alt="" fetchpriority="high"></figure>
  </header>
  <div class="wrap narrow prose">
    ${renderBlocks(a.blocks, t.lang)}
    <aside class="callout callout-strong">${icons.leaf}<div>${esc(t.conditions.disclaimer)}</div></aside>
    <p class="article-cta"><a class="btn btn-primary" href="${t.contacts.whatsappHref}" target="_blank" rel="noopener">${icons.whatsapp}<span>${esc(t.cta.whatsapp)}</span></a></p>
  </div>
</article>
<section class="more-posts">
  <div class="wrap">
    <h2 class="h3">${t.lang === 'kk' ? 'Тағы оқыңыз' : 'Читайте также'}</h2>
    <ul class="post-grid">
      ${join(others, (o, i) => `<li class="post reveal" style="--i:${i}"><a href="${t.dir}/blog/${o.slug}/"><figure><img src="/${o.cover}" alt="" loading="lazy"></figure><div class="post-body"><time datetime="${o.date}">${fmtDate(o.date, t.lang)}</time><h3>${esc(o.title)}</h3></div></a></li>`)}
    </ul>
  </div>
</section>`;
  const ld = { '@context': 'https://schema.org', '@type': 'Article', headline: a.title, datePublished: a.date, inLanguage: t.htmlLang, image: `https://zhan-tan.com/${a.cover}`, author: { '@type': 'Organization', name: t.siteName }, publisher: { '@type': 'Organization', name: t.siteName, logo: { '@type': 'ImageObject', url: 'https://zhan-tan.com/assets/media/logo-512.png' } } };
  return { title: `${a.title} — ${t.shortName}`, description: a.excerpt, bodyClass: 'page-article', ogImage: `https://zhan-tan.com/${a.cover}`, body, jsonLd: ld };
}

export { renderBlocks };
