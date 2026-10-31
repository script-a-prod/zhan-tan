# Жан мен Тән — сайт (KZ + RU)

Статический сайт оздоровительного центра «Жан мен Тән» (zhan-tan.com). Без фреймворков и npm-зависимостей: Node ≥ 20 для сборки, любой статический хостинг для публикации.

## Команды

```bash
node build.mjs            # собрать сайт в dist/
node build.mjs --serve    # собрать, поднять http://localhost:8080 и пересобирать при изменениях
node --test tests/*.test.mjs   # тесты чат-движка
python3 tools/media.py    # пересобрать картинки/логотипы из assets/img/orig (нужен Pillow)
```

## Структура

```
build.mjs                 генератор: читает src/data, рендерит src/templates, копирует ассеты → dist/
src/data/site.kk.json     весь текст главной, меню, FAQ, контакты — казахская версия
src/data/site.ru.json     то же на русском
src/data/articles/        статьи блога: <slug>.kk.json / <slug>.ru.json (блочный формат, см. docs/contracts.md)
src/data/legal/           оферта и политика конфиденциальности
src/data/kb.kk.json, kb.ru.json   база знаний чат-бота
src/templates/*.mjs       шаблоны (layout, home, blog, pages)
src/css/main.css          дизайн-система; fonts.css — self-hosted шрифты Piazzolla + Golos Text
src/js/main.js            интерактив (меню, reveal, счётчики, вкладки методов, видео)
src/js/chat-widget.js     UI чат-бота; chat-engine.js — локальный движок ответов
assets/img/orig           исходные фото с прежнего сайта; assets/media — оптимизированные webp, видео, иконки
docs/facts.md             собранные факты о центре (единый источник правды для текстов)
docs/contracts.md         форматы данных и API модулей
```

## URL-схема

- `/` — казахская версия (по умолчанию), `/ru/` — русская. У каждой страницы есть пара на другом языке (hreflang прописан).
- `/blog/`, `/blog/<slug>/`, `/offer/`, `/privacy/`, `/404.html` — и те же пути под `/ru/`.
- `sitemap.xml`, `robots.txt`, `_redirects`, `_headers` генерируются автоматически (Netlify/Cloudflare Pages-совместимые).

## Деплой

Загрузить содержимое `dist/` на любой статический хостинг (Cloudflare Pages, Netlify, Vercel, GitHub Pages, обычный nginx). Для nginx нужно отдавать `index.html` из папок и 404-страницу:

```nginx
location / { try_files $uri $uri/ $uri/index.html =404; }
error_page 404 /404.html;
location /ru/ { try_files $uri $uri/ $uri/index.html /ru/404.html; }
```

## Как редактировать тексты

Все тексты — в JSON в `src/data/`. Поменяли файл → `node build.mjs`. Новая статья: добавить `src/data/articles/<slug>.kk.json` и `<slug>.ru.json` по формату из `docs/contracts.md`; картинки положить в `assets/media/articles/`.

## Чат-бот: подключение к базе данных / серверу

Сейчас бот работает полностью в браузере: `chat-widget.js` загружает `/data/kb.<lang>.json` и передаёт его в `createEngine()` из `chat-engine.js`. Контракт ответа:

```js
reply(text) → Promise<{ text, suggestions?: string[], actions?: [{ type: 'whatsapp'|'phone'|'link', label, url }] }>
```

Чтобы подключить серверную логику (БД с расписанием потоков, цены, CRM, LLM), достаточно заменить объект `provider` в `src/js/chat-widget.js` — например:

```js
const provider = {
  async greet() { return fetch('/api/chat/greet?lang=' + lang).then(r => r.json()); },
  async reply(text) { return fetch('/api/chat', { method: 'POST', body: JSON.stringify({ lang, text }) }).then(r => r.json()); }
};
```

Формат ответа тот же — UI менять не нужно. Локальный движок можно оставить как офлайн-fallback.

## Что НЕ публикуется намеренно

Цены и даты потоков (бот и сайт отправляют в WhatsApp), медицинские обещания «вылечим». Дисклеймер «не медицинское учреждение» показан в hero, в блоке состояний, в каждой статье, в футере и в чате — это требование оферты центра.
