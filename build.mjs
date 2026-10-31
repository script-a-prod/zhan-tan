// Static site generator for zhan-tan.com — zero dependencies.
// Usage: node build.mjs [--serve] [--port 8080]
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';


const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, 'dist');
const SITE_URL = 'https://zhan-tan.com';
const LANGS = ['kk', 'ru'];
// --base /sub/path  → prefixes every root-relative URL (for GitHub Pages project sites)
const bi = process.argv.indexOf('--base');
const BASE = bi > -1 ? process.argv[bi + 1].replace(/\/$/, '') : '';

const readJSON = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

function loadData() {
  const site = Object.fromEntries(LANGS.map((l) => [l, readJSON(`src/data/site.${l}.json`)]));
  const manifest = readJSON('assets/media/manifest.json');
  const articles = Object.fromEntries(LANGS.map((l) => [l, []]));
  for (const f of fs.readdirSync(path.join(ROOT, 'src/data/articles'))) {
    const m = f.match(/^(.+)\.(kk|ru)\.json$/);
    if (!m) continue;
    articles[m[2]].push(readJSON(`src/data/articles/${f}`));
  }
  for (const l of LANGS) articles[l].sort((a, b) => (a.date < b.date ? 1 : -1));
  const legal = Object.fromEntries(LANGS.map((l) => [l, {}]));
  for (const f of fs.readdirSync(path.join(ROOT, 'src/data/legal'))) {
    const m = f.match(/^(.+)\.(kk|ru)\.json$/);
    if (!m) continue;
    legal[m[2]][m[1]] = readJSON(`src/data/legal/${f}`);
  }
  return { site, manifest, articles, legal };
}

function write(rel, html) {
  const out = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
}

function copyDir(src, dest) {
  fs.cpSync(path.join(ROOT, src), path.join(DIST, dest), { recursive: true });
}

// Templates are imported fresh on every build so the --serve watcher picks up edits.
async function loadTemplates(v) {
  const q = `?v=${v}`;
  const [l, h, b, p] = await Promise.all([
    import(`./src/templates/layout.mjs${q}`),
    import(`./src/templates/home.mjs${q}`),
    import(`./src/templates/blog.mjs${q}`),
    import(`./src/templates/pages.mjs${q}`)
  ]);
  return { layout: l.layout, homePage: h.homePage, blogIndexPage: b.blogIndexPage, articlePage: b.articlePage, legalPage: p.legalPage, notFoundPage: p.notFoundPage };
}

let building = false, queued = false;
async function build() {
  if (building) { queued = true; return; }
  building = true;
  const t0 = Date.now();
  const { layout, homePage, blogIndexPage, articlePage, legalPage, notFoundPage } = await loadTemplates(t0);
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });
  const data = loadData();
  const pages = []; // for sitemap: { path, lang, alt }

  for (const lang of LANGS) {
    const site = data.site[lang];
    const base = site.dir; // '' or '/ru'
    const alt = data.site[lang === 'kk' ? 'ru' : 'kk'];
    const ctx = { site, alt, manifest: data.manifest, articles: data.articles[lang], siteUrl: SITE_URL, version: String(t0) };

    // Home
    const home = homePage(ctx);
    write(`${base}/index.html`.replace(/^\//, ''), layout({ ...ctx, ...home, path: `${base}/`, altPath: `${alt.dir}/` }));
    pages.push({ path: `${base}/`, alt: `${alt.dir}/`, lang });

    // Blog index
    const bi = blogIndexPage(ctx);
    write(`${base}/blog/index.html`.replace(/^\//, ''), layout({ ...ctx, ...bi, path: `${base}/blog/`, altPath: `${alt.dir}/blog/` }));
    pages.push({ path: `${base}/blog/`, alt: `${alt.dir}/blog/`, lang });

    // Articles
    for (const a of data.articles[lang]) {
      const p = articlePage({ ...ctx, article: a });
      write(`${base}/blog/${a.slug}/index.html`.replace(/^\//, ''), layout({ ...ctx, ...p, path: `${base}/blog/${a.slug}/`, altPath: `${alt.dir}/blog/${a.slug}/` }));
      pages.push({ path: `${base}/blog/${a.slug}/`, alt: `${alt.dir}/blog/${a.slug}/`, lang });
    }

    // Legal
    for (const [slug, doc] of Object.entries(data.legal[lang])) {
      const p = legalPage({ ...ctx, doc });
      write(`${base}/${slug}/index.html`.replace(/^\//, ''), layout({ ...ctx, ...p, path: `${base}/${slug}/`, altPath: `${alt.dir}/${slug}/` }));
      pages.push({ path: `${base}/${slug}/`, alt: `${alt.dir}/${slug}/`, lang });
    }

    // 404
    const nf = notFoundPage(ctx);
    write(`${base}/404.html`.replace(/^\//, ''), layout({ ...ctx, ...nf, path: `${base}/404.html`, altPath: `${alt.dir}/404.html`, noindex: true }));
  }

  // Static assets
  copyDir('assets/media', 'assets/media');
  copyDir('assets/fonts', 'assets/fonts');
  copyDir('src/css', 'css');
  copyDir('src/js', 'js');
  fs.mkdirSync(path.join(DIST, 'data'), { recursive: true });
  for (const l of LANGS) fs.copyFileSync(path.join(ROOT, `src/data/kb.${l}.json`), path.join(DIST, `data/kb.${l}.json`));
  fs.copyFileSync(path.join(ROOT, 'assets/media/favicon-32.png'), path.join(DIST, 'favicon.png'));

  // robots, sitemap, root 404 helper
  fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  const urls = pages.map((p) => `  <url>\n    <loc>${SITE_URL}${p.path}</loc>\n    <xhtml:link rel="alternate" hreflang="${p.lang}" href="${SITE_URL}${p.path}"/>\n    <xhtml:link rel="alternate" hreflang="${p.lang === 'kk' ? 'ru' : 'kk'}" href="${SITE_URL}${p.alt}"/>\n  </url>`).join('\n');
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`);
  // Netlify/Cloudflare-style redirects & headers (harmless elsewhere)
  fs.writeFileSync(path.join(DIST, '_redirects'), `/ru/* /ru/404.html 404\n/* /404.html 404\n`);
  fs.writeFileSync(path.join(DIST, '_headers'), `/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/css/*\n  Cache-Control: public, max-age=86400\n/js/*\n  Cache-Control: public, max-age=86400\n`);

  if (BASE) applyBase(DIST);
  console.log(`Built ${pages.length} pages in ${Date.now() - t0} ms → dist/${BASE ? ` (base ${BASE})` : ''}`);
  building = false;
  if (queued) { queued = false; await build(); }
}

// Rewrite root-relative URLs in generated text files to live under BASE.
function applyBase(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) { applyBase(p); continue; }
    if (!/\.(html|css|js|xml|txt)$/.test(f.name)) continue;
    let s = fs.readFileSync(p, 'utf8');
    if (f.name.endsWith('.html')) {
      s = s.replace(/\b(href|src|poster|data-kb|action)="\/(?!\/)/g, `$1="${BASE}/`)
           .replace(/(srcset=")([^"]+)"/g, (m, a, b) => a + b.replace(/(^|,\s*)\/(?!\/)/g, `$1${BASE}/`) + '"')
           .replace(/url\(\/(?!\/)/g, `url(${BASE}/`);
    } else if (f.name.endsWith('.css')) {
      s = s.replace(/url\(['"]?\/(?!\/)/g, (m) => m.replace('/', `${BASE}/`));
    } else if (f.name === '_redirects') {
      s = s.replace(/(^|\s)\//g, `$1${BASE}/`);
    }
    fs.writeFileSync(p, s);
  }
}

function serve(port) {
  const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };
  http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    let file = path.join(DIST, p);
    if (!fs.existsSync(file) && !path.extname(p)) file = path.join(DIST, p, 'index.html');
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      file = path.join(DIST, p.startsWith('/ru/') ? 'ru/404.html' : '404.html');
      res.statusCode = 404;
    }
    const ext = path.extname(file);
    const stat = fs.statSync(file);
    const range = req.headers.range;
    if (range && ext === '.mp4') {
      const [s, e] = range.replace('bytes=', '').split('-');
      const start = parseInt(s, 10), end = e ? parseInt(e, 10) : stat.size - 1;
      res.writeHead(206, { 'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1, 'Content-Type': 'video/mp4' });
      fs.createReadStream(file, { start, end }).pipe(res);
      return;
    }
    res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
    res.setHeader('Content-Length', stat.size);
    fs.createReadStream(file).pipe(res);
  }).listen(port, () => console.log(`Serving dist/ at http://localhost:${port}`));
}

await build();
if (process.argv.includes('--serve')) {
  const i = process.argv.indexOf('--port');
  serve(i > -1 ? Number(process.argv[i + 1]) : 8080);
  // naive watch → rebuild
  const watch = ['src', 'assets/media/manifest.json'];
  let timer;
  for (const w of watch) fs.watch(path.join(ROOT, w), { recursive: true }, () => { clearTimeout(timer); timer = setTimeout(() => build().catch((e) => console.error(e)), 150); });
}
