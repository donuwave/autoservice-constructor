'use client';

import { useEffect, useState } from 'react';
import type { Hours } from '../lib/client';
import s from './Hero.module.css';

const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

function nowInMoscow() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Moscow',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const day = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(get('weekday')) + 1;
  return { day, min: Number(get('hour')) * 60 + Number(get('minute')) };
}

function status(hours: Hours): { open: boolean; text: string } {
  if (hours.alwaysOpen) return { open: true, text: 'Открыто круглосуточно' };
  const rows = hours.schedule ?? [];
  const rowFor = (d: number) => rows.find((r) => r.days.includes(d));
  const { day, min } = nowInMoscow();

  const today = rowFor(day);
  if (today && min >= toMin(today.open) && min < toMin(today.close)) {
    return { open: true, text: `Открыто до ${today.close}` };
  }
  if (today && min < toMin(today.open)) {
    return { open: false, text: `Закрыто, откроемся в ${today.open}` };
  }
  for (let i = 1; i <= 7; i++) {
    const d = ((day - 1 + i) % 7) + 1;
    const r = rowFor(d);
    if (r) {
      const when =
        i === 1
          ? 'завтра'
          : ['', 'в понедельник', 'во вторник', 'в среду', 'в четверг', 'в пятницу', 'в субботу', 'в воскресенье'][d];
      return { open: false, text: `Закрыто, откроемся ${when} в ${r.open}` };
    }
  }
  return { open: false, text: 'Закрыто' };
}

// «Открыто до 19:00» / «Закрыто, откроемся завтра в 8:00» — по московскому времени.
// Считается в браузере, чтобы статус не застывал на момент сборки.
export default function OpenStatus({ hours }: { hours: Hours }) {
  const [s0, setStatus] = useState<{ open: boolean; text: string } | null>(null);

  useEffect(() => {
    try {
      setStatus(status(hours));
    } catch {
      /* без статуса остаётся просто расписание */
    }
  }, [hours]);

  if (!s0) return null;
  return <span className={`${s.openStatus} ${s0.open ? s.isOpen : s.isClosed}`}>{s0.text}</span>;
}
