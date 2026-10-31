const punctuation = /[^\p{L}\p{N}\s]/gu;

export function normalize(text) {
  return String(text ?? '').toLowerCase().replace(/ё/g, 'е').replace(punctuation, ' ').replace(/\s+/g, ' ').trim();
}

const whatsapp = { type: 'whatsapp', label: 'Написать в WhatsApp', url: 'https://wa.me/message/S7XPN7ZI6KZDB1' };

function words(value) { return normalize(value).split(' ').filter(Boolean); }
function stem(value) { return value.length < 5 ? value : value.slice(0, Math.max(4, value.length - 2)); }
function distance(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 3;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0]; row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const current = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length];
}
function phraseScore(query, keyword) {
  const queryWords = words(query); const keyWords = words(keyword);
  if (!keyWords.length) return 0;
  if (keyWords.length > 1 && normalize(query).includes(normalize(keyword))) return 1;
  let found = 0;
  for (const key of keyWords) {
    const keyStem = stem(key);
    if (queryWords.some((word) => word === key || word.startsWith(keyStem) || (key.length > 5 && distance(word, key) <= 1))) found += 1;
  }
  return found / keyWords.length;
}
function replyFrom(item) {
  const reply = { text: item.answer };
  if (item.suggestions?.length) reply.suggestions = item.suggestions.slice(0, 4);
  if (item.actions?.length) reply.actions = item.actions;
  return reply;
}

export function createEngine({ kb, lang }) {
  if (!kb || !['kk', 'ru'].includes(lang)) throw new TypeError('kb and lang are required');
  const intents = Array.isArray(kb.intents) ? kb.intents : [];
  const stateGroups = Array.isArray(kb.stateGroups) ? kb.stateGroups : [];
  const rejected = kb.rejectedStates || kb.notAccepted || [];
  const rejectedTerms = rejected.flatMap((item) => typeof item === 'string' ? [item] : [item.name, ...(item.keywords || [])]).filter(Boolean);
  const listSuggestions = () => (kb.quickReplies || []).slice(0, 4);
  const greet = () => ({ text: kb.greeting, suggestions: listSuggestions() });
  const matches = (term, query, threshold = words(term).length > 1 ? 0.9 : 0.8) => phraseScore(query, term) >= threshold;
  function stateMatch(query) {
    let best = null;
    for (const group of stateGroups) for (const keyword of group.keywords || []) {
      const score = phraseScore(query, keyword);
      const threshold = words(keyword).length > 1 ? 0.9 : keyword.length >= 6 ? 0.8 : 1;
      if (score >= threshold && (!best || score > best.score || score === best.score && keyword.length > best.length)) best = { group, score, length: keyword.length };
    }
    return best?.group;
  }
  function reply(text) {
    const query = normalize(text);
    if (!query) return Promise.resolve(replyFrom(kb.fallback));
    const underAge = /(?:(?:ребенк|дет|бала|балалар|жас).{0,16}\b(?:[0-9]|1[0-3])\b|\b(?:[0-9]|1[0-3])\b.{0,16}(?:ребенк|дет|бала|балалар|жас)|(?:он|онға|он жаста).{0,10}(?:бала|жас))/.test(query);
    if (underAge && kb.ageResponse) return Promise.resolve(replyFrom({ ...kb.ageResponse, suggestions: kb.ageResponse.suggestions || listSuggestions() }));
    if ((kb.pregnancyKeywords || []).some((term) => matches(term, query, 0.8)) && kb.pregnancyResponse) return Promise.resolve(replyFrom({ ...kb.pregnancyResponse, suggestions: kb.pregnancyResponse.suggestions || listSuggestions() }));
    const state = stateMatch(query);
    const rejectedMatch = rejectedTerms.some((term) => {
      const keyWords = words(term);
      if (keyWords.length > 1) return phraseScore(query, term) >= 0.9;
      const key = keyWords[0];
      const safeStem = key.length < 7 ? key : key.slice(0, Math.max(6, key.length - 2));
      return words(query).some((word) => word === key || word.startsWith(safeStem));
    });
    if (rejectedMatch) {
      const item = kb.rejectedResponse || kb.rejectedAnswer || { answer: '' };
      return Promise.resolve(replyFrom({ ...item, suggestions: item.suggestions || listSuggestions() }));
    }
    if (state) {
      const item = { ...state };
      if (/(?:цена|стоимость|сколько стоит|оплата|бағасы|құны|қанша тұрады|төлем)/.test(query)) item.suggestions = [...(item.suggestions || []), lang === 'kk' ? 'Бағасы қанша?' : 'Сколько стоит?'];
      return Promise.resolve(replyFrom(item));
    }
    let best = null;
    for (const item of intents) {
      const score = Math.max(0, ...(item.keywords || []).map((keyword) => phraseScore(query, keyword)));
      const adjusted = score * (item.priority || 1);
      if (!best || adjusted > best.adjusted) best = { item, adjusted, score };
    }
    const threshold = kb.matchThreshold ?? 0.55;
    return Promise.resolve(best && best.score >= threshold ? replyFrom(best.item) : replyFrom(kb.fallback));
  }
  return { greet, reply, suggestions: listSuggestions };
}
