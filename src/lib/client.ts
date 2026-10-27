import { z } from 'zod';

/* ---------- Схема конфига клиента (clients/*.json) ---------- */

const time = z.string().regex(/^\d{1,2}:\d{2}$/, 'Время в формате ЧЧ:ММ');

const HoursRow = z.object({
  /** Дни недели: 1 — понедельник … 7 — воскресенье */
  days: z.array(z.number().int().min(1).max(7)).min(1),
  open: time,
  close: time,
});

const Hours = z.object({
  alwaysOpen: z.boolean().optional(),
  schedule: z.array(HoursRow).optional(),
});

const Branch = z.object({
  /** Название для переключателя: «Кировская», «Гагарина». По умолчанию — адрес */
  name: z.string().optional(),
  address: z.string(),
  /** Если не указан — берётся city клиента */
  city: z.string().optional(),
  addressNote: z.string().optional(),
  coords: z.tuple([z.number(), z.number()]),
  /** Если не указан — общий phone клиента */
  phone: z.string().optional(),
  /** Если не указаны — общие hours клиента */
  hours: Hours.optional(),
});

const ServiceItem = z.object({
  name: z.string(),
  /** Цена в рублях. null — «по запросу» */
  price: z.number().nullable(),
  /** true — выводится «от 1 200 ₽» */
  from: z.boolean().optional(),
  note: z.string().optional(),
  /** Показать в блоке популярных цен на первом экране */
  popular: z.boolean().optional(),
});

const Review = z.object({
  author: z.string(),
  text: z.string(),
  rating: z.number().min(1).max(5),
  date: z.string().optional(),
  source: z.string().optional(),
});

export const ClientSchema = z.object({
  name: z.string(),
  /** Текст на номерном знаке, если отличается от name (короче или латиницей) */
  plateText: z.string().optional(),
  /** Регион на номерном знаке */
  region: z.string().optional(),
  /** Заголовок первого экрана: что делают и где */
  headline: z.string(),
  lead: z.string().optional(),

  city: z.string().optional(),
  /** Адрес, координаты и часы одного филиала. Для сети — вместо них список branches */
  address: z.string().optional(),
  addressNote: z.string().optional(),
  /** [широта, долгота] — правый клик по точке в Яндекс Картах → «Что здесь?» */
  coords: z.tuple([z.number(), z.number()]).optional(),

  /** Несколько филиалов: страница сама переключается на карту с выбором адреса */
  branches: z.array(Branch).optional(),

  phone: z.string(),
  telegram: z.string().optional(),
  whatsapp: z.string().optional(),

  hours: Hours.optional(),

  theme: z
    .object({
      /** Основной цвет: кнопки, акценты. Белый текст на нём должен читаться */
      accent: z.string().optional(),
    })
    .optional(),

  rating: z
    .object({
      value: z.number(),
      count: z.number().int(),
      source: z.string(),
      url: z.string().optional(),
    })
    .optional(),

  services: z.array(
    z.object({
      title: z.string(),
      items: z.array(ServiceItem).min(1),
    }),
  ),
  pricesNote: z.string().optional(),

  advantages: z.array(
    z.object({
      title: z.string(),
      text: z.string(),
      quote: z.object({ text: z.string(), author: z.string() }).optional(),
    }),
  ),

  reviews: z.array(Review),

  booking: z
    .object({
      /** chat id владельца. Если не указан — берётся TELEGRAM_CHAT_ID из .env */
      telegramChatId: z.string().optional(),
      /** Что увидит человек после отправки заявки */
      successText: z.string().optional(),
    })
    .optional(),

  demo: z
    .object({
      enabled: z.boolean(),
      note: z.string().optional(),
    })
    .optional(),

  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),
}).refine((c) => c.branches?.length || (c.address && c.coords && c.hours), {
  message: 'Нужен либо список branches, либо address, coords и hours',
  path: ['branches'],
});

export type Client = z.infer<typeof ClientSchema> & { slug: string };
export type Hours = z.infer<typeof Hours>;

export type ResolvedBranch = {
  id: string;
  name: string;
  address: string;
  city?: string;
  addressNote?: string;
  coords: [number, number];
  phone: string;
  hours: Hours;
};

/** Филиалы клиента в одном виде: и для сети, и для одного адреса */
export function getBranches(client: Client): ResolvedBranch[] {
  if (client.branches?.length) {
    return client.branches.map((b, i) => ({
      id: String(i),
      name: b.name ?? b.address,
      address: b.address,
      city: b.city ?? client.city,
      addressNote: b.addressNote,
      coords: b.coords,
      phone: b.phone ?? client.phone,
      hours: b.hours ?? client.hours ?? {},
    }));
  }
  return [
    {
      id: '0',
      name: client.address!,
      address: client.address!,
      city: client.city,
      addressNote: client.addressNote,
      coords: client.coords!,
      phone: client.phone,
      hours: client.hours!,
    },
  ];
}

/** Одинаковые ли часы у всех филиалов (тогда статус «открыто» показываем в шапке) */
export function sameHours(branches: ResolvedBranch[]): boolean {
  const first = JSON.stringify(branches[0].hours);
  return branches.every((b) => JSON.stringify(b.hours) === first);
}

/** «Нижний Новгород, Дзержинск» по городам филиалов */
export function citiesLabel(branches: ResolvedBranch[]): string {
  const cities = [...new Set(branches.map((b) => b.city).filter(Boolean))] as string[];
  return cities.join(', ');
}

/* ---------- Форматирование ---------- */

const DAY_SHORT = ['', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '');
  return `tel:${digits.startsWith('+') ? digits : '+' + digits}`;
}

export function whatsappHref(phone: string): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}`;
}

export function telegramHref(value: string): string {
  if (value.startsWith('http')) return value;
  if (value.startsWith('@')) return `https://t.me/${value.slice(1)}`;
  if (/^[+\d\s()-]+$/.test(value)) return `https://t.me/+${value.replace(/\D/g, '')}`;
  return `https://t.me/${value}`;
}

export function formatPrice(item: { price: number | null; from?: boolean }): string {
  if (item.price === null) return 'по запросу';
  const n = new Intl.NumberFormat('ru-RU').format(item.price);
  return `${item.from === false ? '' : 'от '}${n} ₽`;
}

/** Строки расписания по дням: подряд идущие дни с одинаковыми часами склеиваются */
export function hoursLines(hours: Hours): { days: string; time: string }[] {
  if (hours.alwaysOpen) return [{ days: 'Ежедневно', time: 'круглосуточно' }];
  const byDay = new Map<number, string>();
  for (const row of hours.schedule ?? []) {
    for (const d of row.days) byDay.set(d, `${row.open}–${row.close}`);
  }
  const lines: { days: string; time: string }[] = [];
  let start = 1;
  for (let d = 2; d <= 8; d++) {
    const prev = byDay.get(d - 1) ?? 'выходной';
    const cur = d <= 7 ? byDay.get(d) ?? 'выходной' : null;
    if (cur !== prev) {
      const days =
        start === d - 1
          ? DAY_SHORT[start]
          : start === 1 && d - 1 === 7
            ? 'Ежедневно'
            : `${DAY_SHORT[start]}–${DAY_SHORT[d - 1]}`;
      lines.push({ days, time: prev });
      start = d;
    }
  }
  return lines;
}

export function hoursShort(hours: Hours): string {
  return hoursLines(hours)
    .map((l) => `${l.days} ${l.time}`)
    .join(', ');
}

export function plural(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

export function yandexMapEmbed([lat, lon]: [number, number]): string {
  return `https://yandex.ru/map-widget/v1/?ll=${lon}%2C${lat}&z=16&pt=${lon}%2C${lat}%2Cpm2rdm`;
}

export function yandexRouteHref([lat, lon]: [number, number]): string {
  return `https://yandex.ru/maps/?rtext=~${lat}%2C${lon}&rtt=auto`;
}

/** Расписание в формате schema.org для разметки */
export function openingHoursSpec(hours: Hours) {
  const names = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  if (hours.alwaysOpen) {
    return [{ '@type': 'OpeningHoursSpecification', dayOfWeek: names.slice(1), opens: '00:00', closes: '23:59' }];
  }
  return (hours.schedule ?? []).map((r) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: r.days.map((d) => names[d]),
    opens: r.open.padStart(5, '0'),
    closes: r.close.padStart(5, '0'),
  }));
}
