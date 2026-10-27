import 'server-only';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { ClientSchema, type Client } from './client';

/* ---------- Загрузка ---------- */

const clientsDir = path.join(process.cwd(), 'clients');

// CLIENTS=slug1,slug2 — публиковать только этих клиентов (остальные конфиги в сборку не попадают)
const only = process.env.CLIENTS?.split(',').map((x) => x.trim()).filter(Boolean);

function load(): Client[] {
  return readdirSync(clientsDir)
    .filter((f) => f.endsWith('.json') && !f.startsWith('_'))
    .filter((f) => !only?.length || only.includes(f.replace(/.json$/, '')))
    .map((f) => {
      const slug = f.replace(/\.json$/, '');
      const parsed = ClientSchema.safeParse(JSON.parse(readFileSync(path.join(clientsDir, f), 'utf8')));
      if (!parsed.success) {
        const issues = parsed.error.issues
          .map((i) => `  • ${i.path.join('.') || '(корень)'}: ${i.message}`)
          .join('\n');
        throw new Error(`Ошибка в clients/${slug}.json:\n${issues}`);
      }
      return { ...parsed.data, slug };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
}

export function getClients(): Client[] {
  return load();
}

export function getClient(slug: string | undefined | null): Client | undefined {
  if (!slug) return undefined;
  return load().find((c) => c.slug === slug);
}

/** Клиент для главной страницы: переменная CLIENT в .env */
export function getMainClient(): Client | undefined {
  const slug = process.env.CLIENT;
  if (!slug) return undefined;
  const client = getClient(slug);
  if (!client) throw new Error(`CLIENT=${slug}, но файла clients/${slug}.json нет`);
  return client;
}
