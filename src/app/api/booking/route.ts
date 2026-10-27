import { z } from 'zod';
import { getClient } from '../../../lib/clients';

// Единственный серверный маршрут: принимает заявку и шлёт её владельцу в Telegram

const Booking = z.object({
  slug: z.string().max(80),
  name: z.string().trim().max(80).optional(),
  phone: z
    .string()
    .trim()
    .max(30)
    .refine((v) => v.replace(/\D/g, '').length >= 10, 'Телефон слишком короткий'),
  car: z.string().trim().max(80).optional(),
  problem: z.string().trim().max(1000).optional(),
  when: z.string().trim().max(40).optional(),
  branch: z.string().trim().max(120).optional(),
  company: z.string().optional(), // ловушка для ботов
});

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Не больше 5 заявок с одного адреса за 10 минут
const hits = new Map<string, number[]>();
function tooMany(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 5;
}

const json = (body: object, status = 200) => Response.json(body, { status });

export async function POST(request: Request) {
  const raw = await request.json().catch(() => null);
  const parsed = Booking.safeParse(raw);
  if (!parsed.success) return json({ ok: false, error: 'invalid' }, 400);

  const data = parsed.data;
  if (data.company) return json({ ok: true }); // бот заполнил скрытое поле — делаем вид, что всё хорошо

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  if (tooMany(ip)) return json({ ok: false, error: 'rate_limited' }, 429);

  const client = getClient(data.slug);
  if (!client) return json({ ok: false, error: 'unknown_client' }, 400);

  // На демо-страницах заявка никуда не уходит: форма просто показывает «Отправлено»
  if (client.demo?.enabled) return json({ ok: true, demo: true });

  const lines = [
    `<b>Новая заявка с сайта</b> · ${escape(client.name)}`,
    '',
    `📞 ${escape(data.phone)}`,
    data.name && `👤 ${escape(data.name)}`,
    data.branch && `📍 ${escape(data.branch)}`,
    data.car && `🚗 ${escape(data.car)}`,
    data.when && `🕒 ${escape(data.when)}`,
    data.problem && `\n${escape(data.problem)}`,
  ].filter(Boolean);
  const text = lines.join('\n');

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = client.booking?.telegramChatId || process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[booking] Telegram не настроен, заявка:\n' + text);
      return json({ ok: true, dryRun: true });
    }
    console.error('[booking] Нет TELEGRAM_BOT_TOKEN или chat id');
    return json({ ok: false, error: 'not_configured' }, 503);
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error('[booking] Telegram ответил', res.status, await res.text());
      return json({ ok: false, error: 'telegram_failed' }, 502);
    }
  } catch (err) {
    console.error('[booking] Не удалось отправить в Telegram', err);
    return json({ ok: false, error: 'telegram_failed' }, 502);
  }

  return json({ ok: true });
}
