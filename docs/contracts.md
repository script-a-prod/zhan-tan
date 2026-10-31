# Контракты модулей (фиксированы архитектором; воркеры их НЕ меняют)

Проект: статический сайт zhan-tan.com (KZ + RU), без фреймворков и npm-зависимостей. Сборка — `node build.mjs` (пишет архитектор) читает JSON из `src/data/` и генерирует `dist/`. Node 26, ES-модули.

## 1. Статьи — `src/data/articles/<slug>.<lang>.json` (lang = kk | ru)
```json
{
  "slug": "gerb",
  "lang": "kk",
  "title": "…",
  "excerpt": "1–2 предложения для карточки",
  "date": "2025-01-09",
  "cover": "assets/media/articles/gerb4.jpg",
  "readingMinutes": 6,
  "tags": ["асқорыту"],
  "blocks": [
    {"type": "h2", "text": "…"},
    {"type": "h3", "text": "…"},
    {"type": "p", "html": "… допускаются только <strong>, <em>, <a href>"},
    {"type": "ul", "items": ["…", "…"]},
    {"type": "ol", "items": ["…"]},
    {"type": "img", "src": "assets/media/articles/gerb1.jpg", "alt": "…", "caption": "…"},
    {"type": "youtube", "id": "mrCizwJDK5s", "caption": "…"},
    {"type": "callout", "html": "выделенный совет/предупреждение"}
  ]
}
```
Слаги (фиксированы): `dari-ulaydy` (Дәрі улайды, Табиғат емдейді), `motivation` (Өмірлік таусылмайтын күш-қуат), `gerb` (ГЭРБ), `gastrit` (Созылмалы гастрит), `ot-kaby` (Өт қабының дискинезиясы). У kk и ru одного слага одинаковая структура блоков (по возможности).

## 2. Юридические страницы — `src/data/legal/<slug>.<lang>.json`
Слаги: `offer` (публичная оферта 15.01.2025), `privacy` (политика конфиденциальности 01.01.2025). Формат: `{ "slug", "lang", "title", "date": "2025-01-15", "blocks": [как у статей, без youtube] }`.

## 3. Чат-бот
### 3.1 База знаний — `src/data/kb.kk.json`, `src/data/kb.ru.json`
Внутреннюю структуру проектирует воркер, но обязательно:
- `greeting` (текст приветствия), `fallback` (ответ при непонимании, ведёт в WhatsApp), `quickReplies` (3–5 стартовых подсказок);
- интенты с ключевыми словами на нужном языке (для kk — учитывать падежные/притяжательные формы, латиницу не нужно; для ru — формы слов) и ответами;
- справочник состояний (с чем приезжают) и список «не принимаем» + противопоказания по методам — бот должен честно отвечать «с этим центр не принимает, обратитесь к врачу»;
- 16 методов, этапы программы, города/адреса, часы, контакты, вопросы о цене → «цены уточняйте в WhatsApp» + действие.
Все факты — только из `docs/facts.md`. Ничего не выдумывать (цены, сроки, гарантии излечения — запрещены).

### 3.2 Движок — `src/js/chat-engine.js` (ES-модуль, без DOM, без зависимостей, работает в браузере и в Node)
```js
export function createEngine({ kb, lang }) // lang: 'kk' | 'ru'
// возвращает объект:
// {
//   greet(): Reply,
//   reply(text: string): Promise<Reply>,   // всегда Promise — позже заменится на запрос к БД/серверу
//   suggestions(): string[]
// }
// Reply = {
//   text: string,                      // простой текст, переносы строк \n допустимы, без HTML
//   suggestions?: string[],            // подсказки-кнопки (до 4)
//   actions?: Array<{ type: 'whatsapp'|'phone'|'link', label: string, url: string }>
// }
export function normalize(text: string): string  // lower-case, ё→е, убрать пунктуацию, схлопнуть пробелы
```
Матчинг: нормализация + взвешенное совпадение ключевых слов/основ (стемминг по префиксу допустим), порог уверенности, при нескольких интентах — лучший, при низкой уверенности — fallback. Детект упоминания состояния из списка «не принимаем» имеет приоритет над остальными интентами.

### 3.3 Тесты — `tests/chat-engine.test.mjs` (node:test, запуск `node --test tests/`)
Минимум 25 кейсов на обоих языках: приветствие, цена, адрес, часы, WhatsApp, 16 методов, конкретный метод (суық су / холодная вода, Вим Хоф), состояние из списка (диабет 2 типа), состояние из «не принимаем» (эпилепсия, гепатит, дети 10 лет), длительность программы, кто основатель, непонятный ввод → fallback, опечатки/разные формы слов.

## 4. Медиа — `tools/media.py` (Python 3 + Pillow, без других зависимостей) и `assets/media/`
- Вход: `assets/img/orig/*`. Выход: `assets/media/img/<name>-<w>.webp` для ширин 480, 960, 1600 (не апскейлить; если исходник меньше — только доступные ширины) + `assets/media/img/<name>-lqip.webp` (24px, для размытого плейсхолдера).
- Кураторский набор имён (фиксирован): hero-lake←priroda.jpg, lake-2←original.jpg, meadow←priroda-offer.png, meditate←les-priroda-zelen-mokh-kamni-derevia-kusty-voda-devushka-sha.jpg, yoga←adfa4e1b453a59dbc33b42871cc41514.png, cold←holodny-dush.jpg, herbs-1←fito.jpg, herbs-2←m_2_669bb3675396.jpg, herbs-3←XOr0S0Y4-GK7Yi-d34_4fBRXzqOZir9eP9ON9bVMU0vg3mdcdcNcNmIY1i-knXTXdM3XbsFEWjAuki5qxqM70TD9.jpg, food←healthfood.jpg, jump←unnamed.jpg.
- Иллюстрации статей копируются как есть в `assets/media/articles/` (gerb1–4.jpg, gastrit-protokol.jpg, ot-1.jpg, ot2.jpg, ot3.jpg, scale_1200.png, zhtso.jpg, ssa2.webp, 048ec3af47346f67119a391590381bb0_cropped_666x720.jpg, motivation.webp), но перекодированные в webp качеством 82, макс. ширина 1200.
- Логотип: из logo-04.png (обрезать прозрачные поля) → `assets/media/logo-512.png`, `logo-192.png`, `apple-touch-icon.png` (180), `favicon-32.png`, `favicon-16.png`; из logo-06.png → `logo-mono-256.png`.
- Манифест `assets/media/manifest.json`: `{ "<name>": { "widths": [480, 960, 1600], "width": W, "height": H, "aspect": "W/H" } }` (W,H — размеры исходника).
- Скрипт идемпотентен, запуск: `python3 tools/media.py`.
- Шрифты уже лежат в `assets/fonts/*.woff2` (Piazzolla: latin/cyrillic/cyrillic-ext ×{regular, italic}, переменный opsz 8..30 wght 300..900; Golos Text: latin/cyrillic/cyrillic-ext, wght 400..900). Нужен `src/css/fonts.css` с @font-face (font-display: swap, unicode-range по сабсетам Google Fonts: latin U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD; cyrillic U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116; cyrillic-ext U+0460-052F,U+1C80-1C8A,U+20B4,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F). Пути в CSS: `../assets/fonts/…` НЕ использовать — писать абсолютные `/assets/fonts/<file>.woff2`.

## Общие правила для воркеров
- Менять только файлы своей задачи. Не трогать `build.mjs`, `src/templates/`, `src/css/main.css`, `src/js/main.js`, `src/js/chat-widget.js`, `src/data/site.*.json`.
- Не добавлять npm-зависимости, не создавать package.json, не делать git-коммиты.
- Текст на казахском — грамотный литературный казахский (кириллица), на русском — нейтральный, без канцелярита и «ИИ-штампов» («в современном мире», «не секрет, что», «погрузитесь в мир»).
