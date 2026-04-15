export const SAVJETNIK_API_BASE = 'https://ab.hr/wp-json/polj/v1';

export const QUICK_PROMPTS = [
  'Zaštita',
  'Prihrana',
  'Bolesti',
  'Poticaji u Hrvatskoj',
  'Što je na ovoj fotografiji?',
];

export const WELCOME_MESSAGE =
  'Pozdrav! Postavite pitanje o poljoprivredi, zaštiti bilja, gnojidbi, poticajima ili dodajte fotografiju problema.';

export function buildSavjetnikUrl(path = '') {
  const clean = String(path || '').replace(/^\/+/, '');
  return `${SAVJETNIK_API_BASE}/${clean}`;
}

export function normalizeNewsItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.news)) return payload.news;
  return [];
}

export function normalizeReply(payload) {
  if (typeof payload?.reply === 'string') return payload.reply.trim();
  if (typeof payload?.answer === 'string') return payload.answer.trim();
  if (typeof payload?.message === 'string') return payload.message.trim();
  return '';
}

export function formatNewsSource(item) {
  const parts = [item?.source, item?.publisher, item?.date]
    .map((part) => String(part || '').trim())
    .filter(Boolean);
  return parts.join(' • ');
}

export function toDisplayText(value) {
  return String(value || '').trim();
}
