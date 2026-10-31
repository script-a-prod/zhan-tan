import { esc, rich, join, pic, icons } from './util.mjs';

export function homePage({ site: t, manifest, articles }) {
  const c = t.contacts;
  const wa = `<a class="btn btn-primary" href="${c.whatsappHref}" target="_blank" rel="noopener">${icons.whatsapp}<span>${esc(t.cta.whatsapp)}</span></a>`;

  const hero = `
<section class="hero" id="hero">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="eyebrow reveal">${esc(t.hero.eyebrow)}</p>
      <h1 class="display reveal">${rich(t.hero.title)}</h1>
      <p class="lead reveal">${esc(t.hero.lead)}</p>
      <div class="hero-actions reveal">
        ${wa}
        <a class="btn btn-ghost" href="#bagdarlama">${esc(t.cta.program)}${icons.arrowDown}</a>
      </div>
      <p class="hero-note reveal">${icons.leaf}<span>${esc(t.hero.note)}</span></p>
    </div>
    <div class="hero-media reveal">
      <figure class="hero-photo" data-parallax="0.08">
        ${pic(manifest, 'hero-lake', { alt: t.lang === 'kk' ? 'Талғар таулары, көл' : 'Горы Талгара, озеро', sizes: '(min-width: 900px) 55vw, 100vw', loading: 'eager', fetchpriority: 'high', cls: 'hero-img' })}
      </figure>
      <div class="hero-card hero-stat">
        <strong>${esc(t.hero.stat.value)}</strong>
        <span>${esc(t.hero.stat.label)}</span>
      </div>
      <a class="hero-card hero-video" href="#natizhe" aria-label="${esc(t.hero.videoLabel)}">
        <video muted loop playsinline preload="none" poster="/assets/media/video/story-3.jpg" data-autoplay>
          <source src="/assets/media/video/story-3.mp4" type="video/mp4">
        </video>
        <span class="hero-video-label">${icons.play}${esc(t.hero.videoLabel)}</span>
      </a>
    </div>
  </div>
  <a class="scroll-cue" href="#manifest">${esc(t.hero.scroll)}${icons.arrowDown}</a>
</section>`;

  const manifesto = `
<section class="manifesto" id="manifest">
  <div class="wrap two-col">
    <div class="col-head">
      <p class="eyebrow reveal">${esc(t.manifesto.eyebrow)}</p>
      <h2 class="display-2 reveal">${rich(t.manifesto.title)}</h2>
      <blockquote class="pull reveal">${esc(t.manifesto.quote)}</blockquote>
    </div>
    <div class="col-body">
      ${join(t.manifesto.paragraphs, (p) => `<p class="prose-lg reveal">${esc(p)}</p>`)}
      <ul class="principles reveal">
        ${join(t.manifesto.principles, (p, i) => `<li><span class="num">0${i + 1}</span><div><strong>${esc(p.title)}</strong><p>${esc(p.text)}</p></div></li>`)}
      </ul>
    </div>
  </div>
</section>`;

  const stats = `
<section class="stats" aria-label="${esc(t.stats.eyebrow)}">
  <div class="wrap">
    <ul class="stats-row">
      ${join(t.stats.items, (s) => `<li class="reveal"><strong class="count" data-count="${s.value}" data-decimals="${s.decimals || 0}" data-suffix="${esc(s.suffix)}">${s.decimals ? s.value.toFixed(s.decimals) : s.value.toLocaleString('ru-RU')}${esc(s.suffix)}</strong><span>${esc(s.label)}</span></li>`)}
    </ul>
  </div>
</section>`;

  const methods = `
<section class="methods" id="adister">
  <div class="wrap">
    <div class="section-head">
      <p class="eyebrow reveal">${esc(t.methods.eyebrow)}</p>
      <h2 class="display-2 reveal">${rich(t.methods.title)}</h2>
      <p class="lead reveal">${esc(t.methods.lead)}</p>
    </div>
    <div class="methods-grid">
      <ol class="methods-list reveal" role="tablist" aria-label="${esc(t.methods.hint)}">
        ${join(t.methods.items, (m, i) => `<li><button role="tab" id="mtab-${i}" aria-selected="${i === 0}" aria-controls="mpanel" data-idx="${i}" class="method-tab${i === 0 ? ' is-active' : ''}"><span class="num">${m.n}</span><span class="method-title">${esc(m.title)}</span><span class="method-short">${esc(m.short)}</span>${icons.arrow}</button></li>`)}
      </ol>
      <div class="methods-panel reveal" id="mpanel" role="tabpanel">
        ${join(t.methods.items, (m, i) => `<article class="method-detail${i === 0 ? ' is-active' : ''}" data-idx="${i}" ${i === 0 ? '' : 'hidden'}>
          <figure class="method-fig">${pic(manifest, m.img, { alt: m.title, sizes: '(min-width: 900px) 40vw, 100vw' })}</figure>
          <div class="method-text">
            <span class="num">${m.n} / 16</span>
            <h3>${esc(m.title)}</h3>
            <p>${esc(m.text)}</p>
          </div>
        </article>`)}
      </div>
    </div>
  </div>
</section>`;

  const program = `
<section class="program" id="bagdarlama">
  <div class="wrap">
    <div class="section-head">
      <p class="eyebrow reveal">${esc(t.program.eyebrow)}</p>
      <h2 class="display-2 reveal">${rich(t.program.title)}</h2>
      <p class="lead reveal">${esc(t.program.lead)}</p>
    </div>
    <ol class="stages">
      ${join(t.program.stages, (s) => `<li class="stage reveal"><span class="stage-n">${s.n}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`)}
    </ol>
  </div>
  <div class="day">
    <div class="wrap day-head">
      <h3 class="h3 reveal">${esc(t.program.dayTitle)}</h3>
      <p class="muted reveal">${esc(t.program.dayNote)}</p>
    </div>
    <div class="day-track" tabindex="0" aria-label="${esc(t.program.dayTitle)}">
      <ol class="day-list">
        ${join(t.program.day, (d, i) => `<li class="day-item reveal" style="--i:${i}"><time>${d.time}</time><strong>${esc(d.title)}</strong><span>${esc(d.text)}</span></li>`)}
      </ol>
    </div>
  </div>
</section>`;

  const conditions = `
<section class="conditions" id="zhagday">
  <div class="wrap">
    <div class="section-head">
      <p class="eyebrow reveal">${esc(t.conditions.eyebrow)}</p>
      <h2 class="display-2 reveal">${rich(t.conditions.title)}</h2>
      <p class="lead reveal">${esc(t.conditions.lead)}</p>
    </div>
    <div class="cond-groups">
      ${join(t.conditions.groups, (g) => `<div class="cond-group reveal"><h3>${esc(g.title)}</h3><ul class="chips">${join(g.items, (x) => `<li>${esc(x)}</li>`)}</ul></div>`)}
    </div>
    <div class="not-accept reveal">
      <div class="not-head">
        <h3>${esc(t.conditions.notTitle)}</h3>
        <p>${esc(t.conditions.notLead)}</p>
      </div>
      <details class="disclosure">
        <summary><span>${t.lang === 'kk' ? 'Толық тізім' : 'Полный список'}</span>${icons.plus}</summary>
        <ul class="plain-list cols">${join(t.conditions.notItems, (x) => `<li>${esc(x)}</li>`)}</ul>
      </details>
      <details class="disclosure">
        <summary><span>${esc(t.conditions.contraTitle)}</span>${icons.plus}</summary>
        <div class="contra-grid">${join(t.conditions.contra, (g) => `<div><h4>${esc(g.title)}</h4><ul class="plain-list">${join(g.items, (x) => `<li>${esc(x)}</li>`)}</ul></div>`)}</div>
      </details>
    </div>
    <p class="disclaimer reveal">${icons.leaf}<span>${esc(t.conditions.disclaimer)}</span></p>
  </div>
</section>`;

  const stories = `
<section class="stories" id="natizhe">
  <div class="wrap">
    <div class="section-head">
      <p class="eyebrow reveal">${esc(t.stories.eyebrow)}</p>
      <h2 class="display-2 reveal">${rich(t.stories.title)}</h2>
      <p class="lead reveal">${esc(t.stories.lead)}</p>
    </div>
    <div class="story-videos">
      ${join(t.stories.videos, (v, i) => `<figure class="story reveal" style="--i:${i}">
        <button class="story-play" data-video aria-label="${esc(v.title)}">
          <video preload="none" playsinline poster="${v.poster}"><source src="${v.src}" type="video/mp4"></video>
          <span class="play-badge">${icons.play}</span>
        </button>
        <figcaption><strong>${esc(v.title)}</strong><span>${esc(v.sub)}</span></figcaption>
      </figure>`)}
    </div>
    <div class="quotes-rating">
      <ul class="quotes">
        ${join(t.stories.quotes, (q, i) => `<li class="quote reveal" style="--i:${i}"><p>«${esc(q.text)}»</p><footer><strong>${esc(q.author)}</strong><span>${esc(q.source)}</span></footer></li>`)}
      </ul>
      <a class="rating reveal" href="${c.twogis}" target="_blank" rel="noopener">
        <strong>${t.stories.rating.value}</strong>
        <span class="stars">${icons.star}${icons.star}${icons.star}${icons.star}${icons.star}</span>
        <span>${esc(t.stories.rating.label)}</span>
        <small>${esc(t.stories.rating.sub)}</small>
        <em>${esc(t.stories.rating.link)} ${icons.arrow}</em>
      </a>
    </div>
    <h3 class="h3 reveal yt-title">${esc(t.stories.youtubeTitle)}</h3>
    <ul class="yt-grid">
      ${join(t.stories.youtube, (v, i) => `<li class="yt reveal" style="--i:${i}"><button class="yt-thumb" data-yt="${v.id}" aria-label="${esc(v.title)}"><img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" loading="lazy" width="480" height="360"><span class="play-badge">${icons.play}</span></button><p>${esc(v.title)}</p></li>`)}
    </ul>
    <p class="reveal"><a class="link-arrow" href="${c.youtube}" target="_blank" rel="noopener">${esc(t.stories.allVideos)}${icons.arrow}</a></p>
  </div>
</section>`;

  const about = `
<section class="about" id="ortalyq">
  <div class="wrap two-col">
    <div class="col-head">
      <p class="eyebrow reveal">${esc(t.about.eyebrow)}</p>
      <h2 class="display-2 reveal">${rich(t.about.title)}</h2>
      <figure class="about-photo reveal">${pic(manifest, 'meditate', { alt: '', sizes: '(min-width: 900px) 40vw, 100vw' })}</figure>
    </div>
    <div class="col-body">
      ${join(t.about.paragraphs, (p) => `<p class="prose-lg reveal">${esc(p)}</p>`)}
      <div class="founder reveal">
        <p class="eyebrow">${esc(t.about.founderEyebrow)}</p>
        <h3>${esc(t.about.founderName)}</h3>
        <p class="founder-role">${esc(t.about.founderRole)}</p>
        <p>${esc(t.about.founderText)}</p>
      </div>
      <h3 class="h4 reveal">${esc(t.about.teamTitle)}</h3>
      <ul class="team reveal">${join(t.about.team, (m) => `<li><strong>${esc(m.name)}</strong><p>${esc(m.text)}</p></li>`)}</ul>
      <h3 class="h4 reveal">${esc(t.about.socialTitle)}</h3>
      <ul class="socials reveal">${join(t.about.socials, (s) => `<li><a href="${s.href}" target="_blank" rel="noopener"><strong>${esc(s.label)}</strong><span>${esc(s.sub)}</span>${icons.arrow}</a></li>`)}</ul>
    </div>
  </div>
</section>`;

  const places = `
<section class="places" id="qayda">
  <div class="wrap">
    <div class="section-head">
      <p class="eyebrow reveal">${esc(t.places.eyebrow)}</p>
      <h2 class="display-2 reveal">${rich(t.places.title)}</h2>
    </div>
    <ul class="place-grid">
      ${join(t.places.items, (p, i) => `<li class="place reveal${p.main ? ' is-main' : ''}" style="--i:${i}">
        ${p.main ? `<figure class="place-photo">${pic(manifest, 'lake-2', { alt: '', sizes: '(min-width: 900px) 50vw, 100vw' })}</figure>` : ''}
        <div class="place-body">
          <p class="eyebrow">${esc(p.kind)}</p>
          <h3>${esc(p.city)}</h3>
          <p class="place-addr">${icons.pin}<span>${esc(p.address)}</span></p>
          <p class="place-hours">${icons.clock}<span>${esc(p.hours)}</span></p>
          ${p.phone ? `<p class="place-hours">${icons.phone}<a href="tel:${p.phone.replace(/\s/g, '')}">${p.phone}</a></p>` : ''}
          ${p.note ? `<p class="muted">${esc(p.note)}</p>` : ''}
          <a class="link-arrow" href="${p.link}" target="_blank" rel="noopener">${esc(p.linkLabel)}${icons.arrow}</a>
        </div>
      </li>`)}
      <li class="place place-other reveal">
        <div class="place-body">
          <p class="eyebrow">${esc(t.places.otherTitle)}</p>
          <p>${esc(t.places.other)}</p>
          <a class="btn btn-ghost btn-sm" href="${c.whatsappHref}" target="_blank" rel="noopener">${icons.whatsapp}<span>WhatsApp</span></a>
        </div>
      </li>
    </ul>
  </div>
</section>`;

  const blog = `
<section class="blog-teaser" id="blog">
  <div class="wrap">
    <div class="section-head row">
      <div>
        <p class="eyebrow reveal">${esc(t.blog.eyebrow)}</p>
        <h2 class="display-2 reveal">${rich(t.blog.title)}</h2>
        <p class="lead reveal">${esc(t.blog.lead)}</p>
      </div>
      <a class="link-arrow reveal" href="${t.dir}/blog/">${esc(t.cta.readAll)}${icons.arrow}</a>
    </div>
    <ul class="post-grid">
      ${join(articles.slice(0, 5), (a, i) => `<li class="post reveal" style="--i:${i}"><a href="${t.dir}/blog/${a.slug}/">
        <figure><img src="/${a.cover}" alt="" loading="lazy"></figure>
        <div class="post-body"><time datetime="${a.date}">${fmtDate(a.date, t.lang)}</time><h3>${esc(a.title)}</h3><p>${esc(a.excerpt)}</p><span class="muted">${a.readingMinutes} ${esc(t.cta.readMin)}</span></div>
      </a></li>`)}
    </ul>
  </div>
</section>`;

  const faq = `
<section class="faq" id="faq">
  <div class="wrap two-col">
    <div class="col-head">
      <p class="eyebrow reveal">${esc(t.faq.eyebrow)}</p>
      <h2 class="display-2 reveal">${rich(t.faq.title)}</h2>
    </div>
    <div class="col-body">
      ${join(t.faq.items, (f) => `<details class="faq-item reveal"><summary><span>${esc(f.q)}</span>${icons.plus}</summary><p>${esc(f.a)}</p></details>`)}
    </div>
  </div>
</section>`;

  const contact = `
<section class="contact" id="baylanys">
  <div class="wrap contact-grid">
    <div class="contact-copy">
      <p class="eyebrow reveal">${esc(t.contact.eyebrow)}</p>
      <h2 class="display-2 reveal">${rich(t.contact.title)}</h2>
      <p class="lead reveal">${esc(t.contact.lead)}</p>
      <div class="hero-actions reveal">${wa}<a class="btn btn-ghost" href="${c.phoneHref}">${icons.phone}<span>${c.phone}</span></a></div>
    </div>
    <dl class="contact-list reveal">
      <div><dt>${esc(t.contact.whatsappLabel)}</dt><dd><a href="${c.whatsappHref}" target="_blank" rel="noopener">${c.whatsapp}</a>${join(c.whatsappExtra, (n) => `<a href="https://wa.me/${n.replace(/\D/g, '')}" target="_blank" rel="noopener">${n}</a>`)}</dd></div>
      <div><dt>${esc(t.contact.phoneLabel)}</dt><dd><a href="${c.phoneHref}">${c.phone}</a></dd></div>
      <div><dt>${esc(t.contact.emailLabel)}</dt><dd><a href="mailto:${c.email}">${c.email}</a></dd></div>
      <div><dt>${esc(t.contact.hrLabel)}</dt><dd><a href="tel:${c.hr.replace(/\s/g, '')}">${c.hr}</a></dd></div>
      <div><dt>${esc(t.contact.hoursLabel)}</dt><dd>${esc(t.contact.hours)}</dd></div>
      <div><dt>${esc(t.contact.requisitesTitle)}</dt><dd class="small">${join(t.contact.requisites, (r) => `<span>${esc(r)}</span>`)}</dd></div>
    </dl>
  </div>
</section>`;

  return {
    title: t.meta.title,
    description: t.meta.description,
    bodyClass: 'page-home',
    ogImage: `https://zhan-tan.com/assets/media/img/hero-lake-1600.webp`,
    body: hero + manifesto + stats + methods + program + conditions + stories + about + places + blog + faq + contact
  };
}

export function fmtDate(iso, lang) {
  const d = new Date(iso);
  const mk = ['қаңтар', 'ақпан', 'наурыз', 'сәуір', 'мамыр', 'маусым', 'шілде', 'тамыз', 'қыркүйек', 'қазан', 'қараша', 'желтоқсан'];
  const mr = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  return `${d.getDate()} ${(lang === 'kk' ? mk : mr)[d.getMonth()]} ${d.getFullYear()}`;
}
