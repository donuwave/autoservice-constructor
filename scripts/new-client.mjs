// Создаёт конфиг нового клиента из примера: npm run new -- time-service "Тайм-Сервис"
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const [slug, name] = process.argv.slice(2);
if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
  console.error('Использование: npm run new -- <slug латиницей> "Название"');
  process.exit(1);
}

const target = new URL(`../clients/${slug}.json`, import.meta.url);
if (existsSync(target)) {
  console.error(`clients/${slug}.json уже есть`);
  process.exit(1);
}

const example = JSON.parse(readFileSync(new URL('../clients/stupica.json', import.meta.url), 'utf8'));
delete example._comment;
example.name = name ?? slug;
example.demo = { enabled: true, note: 'Это пример сайта. Цены и тексты примерные — поправим под вас.' };

writeFileSync(target, JSON.stringify(example, null, 2) + '\n');
console.log(`Готово: clients/${slug}.json. Замени адрес, телефон, часы, цены и отзывы на реальные.`);
console.log(`Страница: http://localhost:3000/${slug}`);
