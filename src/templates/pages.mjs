import { esc } from './util.mjs';
import { renderBlocks } from './blog.mjs';
import { fmtDate } from './home.mjs';

export function legalPage({ site: t, doc }) {
  const body = `
<section class="page-head">
  <div class="wrap narrow">
    <a class="crumb" href="${t.dir}/">← ${esc(t.cta.back)}</a>
    <h1 class="display-2">${esc(doc.title)}</h1>
    <p class="muted">${esc(t.legalPage.updated)}: ${fmtDate(doc.date, t.lang)}</p>
  </div>
</section>
<section class="legal"><div class="wrap narrow prose prose-legal">${renderBlocks(doc.blocks, t.lang)}</div></section>`;
  return { title: `${doc.title} — ${t.shortName}`, description: doc.title, bodyClass: 'page-legal', body };
}

export function notFoundPage({ site: t }) {
  const body = `
<section class="page-head notfound">
  <div class="wrap narrow">
    <p class="eyebrow">404</p>
    <h1 class="display">${esc(t.notFound.title)}</h1>
    <p class="lead">${esc(t.notFound.text)}</p>
    <p><a class="btn btn-primary" href="${t.dir}/">${esc(t.notFound.link)}</a></p>
  </div>
</section>`;
  return { title: `${t.notFound.title} — ${t.shortName}`, description: t.notFound.text, bodyClass: 'page-404', body };
}
