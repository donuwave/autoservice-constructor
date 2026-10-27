// Показывает chat id тех, кто писал боту: npm run chat-id
// Сначала напиши боту что-нибудь (или пусть напишет владелец сервиса), потом запусти скрипт.
import { readFileSync, existsSync } from 'node:fs';

let token = process.env.TELEGRAM_BOT_TOKEN;
if (!token && existsSync('.env')) {
  const line = readFileSync('.env', 'utf8')
    .split('\n')
    .find((l) => l.startsWith('TELEGRAM_BOT_TOKEN='));
  token = line?.split('=')[1]?.trim();
}
if (!token) {
  console.error('Нет TELEGRAM_BOT_TOKEN в .env');
  process.exit(1);
}

const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
const data = await res.json();
if (!data.ok) {
  console.error('Telegram ответил ошибкой:', data.description);
  process.exit(1);
}

const chats = new Map();
for (const u of data.result) {
  const chat = (u.message ?? u.my_chat_member ?? u.channel_post)?.chat;
  if (chat) chats.set(chat.id, chat);
}
if (chats.size === 0) {
  console.log('Боту пока никто не писал. Отправь ему /start и запусти снова.');
} else {
  for (const c of chats.values()) {
    const who = c.title ?? [c.first_name, c.last_name, c.username && '@' + c.username].filter(Boolean).join(' ');
    console.log(`${c.id}\t${who}`);
  }
}
