// Chat widget UI. Talks to the engine through the `reply()` contract, so a server-backed
// provider (DB / LLM) can replace createEngine() without touching this file.
import { createEngine } from './chat-engine.js';

const root = document.getElementById('chat');
if (root) init(root);

async function init(root) {
  const lang = root.dataset.lang;
  const fab = root.querySelector('#chat-fab'), panel = root.querySelector('#chat-panel'), log = root.querySelector('#chat-log');
  const suggest = root.querySelector('#chat-suggest'), form = root.querySelector('#chat-form'), input = root.querySelector('#chat-input');
  const closeBtn = root.querySelector('#chat-close'), resetBtn = root.querySelector('#chat-reset');
  const storeKey = `zt-chat-${lang}`;
  let engine = null, history = [];

  const provider = {
    // Swap this for fetch('/api/chat') later; keep the same return shape.
    async ready() {
      if (engine) return engine;
      const kb = await fetch(root.dataset.kb).then((r) => r.json());
      engine = createEngine({ kb, lang });
      return engine;
    },
    async reply(text) { return (await this.ready()).reply(text); },
    async greet() { return (await this.ready()).greet(); }
  };

  const open = async () => {
    root.dataset.open = 'true'; panel.hidden = false; fab.setAttribute('aria-expanded', 'true');
    if (!history.length) { await botTurn(() => provider.greet()); }
    else render();
    setTimeout(() => input.focus(), 50);
  };
  const close = () => { root.dataset.open = 'false'; panel.hidden = true; fab.setAttribute('aria-expanded', 'false'); fab.focus(); };
  fab.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  resetBtn.addEventListener('click', async () => { history = []; save(); log.innerHTML = ''; await botTurn(() => provider.greet()); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && root.dataset.open === 'true') close(); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    push({ role: 'user', text });
    await botTurn(() => provider.reply(text));
  });
  suggest.addEventListener('click', async (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    push({ role: 'user', text: b.textContent });
    await botTurn(() => provider.reply(b.textContent));
  });

  async function botTurn(fn) {
    setSuggestions([]);
    const typing = el('div', 'msg msg-bot typing', '<i></i><i></i><i></i>');
    log.append(typing); scrollEnd();
    const t0 = Date.now();
    let r;
    try { r = await fn(); } catch (err) { console.error(err); r = { text: lang === 'kk' ? 'Кешіріңіз, қате кетті. WhatsApp арқылы жазыңыз.' : 'Простите, произошла ошибка. Напишите нам в WhatsApp.' }; }
    const wait = Math.min(1400, Math.max(500, (r.text || '').length * 12)) - (Date.now() - t0);
    await new Promise((res) => setTimeout(res, Math.max(0, wait)));
    typing.remove();
    push({ role: 'bot', text: r.text, actions: r.actions || [], suggestions: r.suggestions || [] });
    setSuggestions(r.suggestions || []);
  }

  function push(m) { history.push(m); save(); renderOne(m); scrollEnd(); }
  function render() { log.innerHTML = ''; history.forEach(renderOne); const last = history[history.length - 1]; setSuggestions((last && last.role === 'bot' && last.suggestions) || []); scrollEnd(); }
  function renderOne(m) {
    log.append(el('div', `msg msg-${m.role}`, escapeHtml(m.text)));
    if (m.actions && m.actions.length) {
      const a = el('div', 'msg-actions');
      for (const x of m.actions) {
        const link = document.createElement('a');
        link.href = x.url; link.textContent = x.label;
        if (x.type !== 'phone') { link.target = '_blank'; link.rel = 'noopener'; }
        a.append(link);
      }
      log.append(a);
    }
  }
  function setSuggestions(list) {
    suggest.innerHTML = '';
    for (const s of list.slice(0, 4)) { const b = document.createElement('button'); b.type = 'button'; b.textContent = s; suggest.append(b); }
  }
  function scrollEnd() { log.scrollTop = log.scrollHeight; }
  function save() { try { sessionStorage.setItem(storeKey, JSON.stringify(history.slice(-40))); } catch {} }
  try { history = JSON.parse(sessionStorage.getItem(storeKey) || '[]'); } catch { history = []; }
  if (history.length) render();
}

function el(tag, cls, html = '') { const n = document.createElement(tag); n.className = cls; n.innerHTML = html; return n; }
function escapeHtml(s = '') { return s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }
