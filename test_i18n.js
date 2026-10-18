const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('index.html', 'utf-8');

const context = { window: {} };
context.window = context;
const dataCode = fs.readFileSync('js/data.js', 'utf-8');
vm.runInNewContext(dataCode, context);
const TRANSLATIONS = context.TRANSLATIONS || context.window.TRANSLATIONS;

const i18nRegex = /data-i18n="([^"]+)"/g;
const placeholderRegex = /data-i18n-placeholder="([^"]+)"/g;

let match;
const keys = new Set();
while ((match = i18nRegex.exec(html)) !== null) {
  keys.add(match[1]);
}
while ((match = placeholderRegex.exec(html)) !== null) {
  keys.add(match[1]);
}

console.log('Total i18n keys in index.html:', keys.size);

const missingUz = [];
const missingRu = [];
const missingEn = [];

for (const k of keys) {
  if (!TRANSLATIONS.uz || !TRANSLATIONS.uz[k]) missingUz.push(k);
  if (!TRANSLATIONS.ru || !TRANSLATIONS.ru[k]) missingRu.push(k);
  if (!TRANSLATIONS.en || !TRANSLATIONS.en[k]) missingEn.push(k);
}

console.log('Missing UZ keys (' + missingUz.length + '):', missingUz);
console.log('Missing RU keys (' + missingRu.length + '):', missingRu);
console.log('Missing EN keys (' + missingEn.length + '):', missingEn);
