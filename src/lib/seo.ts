import type { Metadata, Viewport } from 'next';
import { type Client, hoursShort, getBranches, citiesLabel, plural, sameHours } from './client';

export function clientMetadata(client: Client, { noindex = false, path = '/' } = {}): Metadata {
  const branches = getBranches(client);
  const main = branches[0];
  const multi = branches.length > 1;

  const title =
    client.seo?.title ??
    (multi
      ? `${client.name}: автосервисы, ${citiesLabel(branches)}`
      : `${client.name}: автосервис на ${main.address.replace(/^ул\.\s*/, '')}`);

  const where = multi
    ? `${branches.length} ${plural(branches.length, 'филиал', 'филиала', 'филиалов')}: ${citiesLabel(branches)}`
    : `${main.address}${main.city ? ', ' + main.city : ''}`;
  const hours = sameHours(branches) ? ` ${hoursShort(main.hours)}.` : '';
  const description =
    client.seo?.description ?? `${client.headline}. ${where}.${hours} Запись онлайн и по телефону ${client.phone}.`;

  return {
    title,
    description,
    robots: noindex ? { index: false, follow: false } : undefined,
    alternates: noindex ? undefined : { canonical: path },
    openGraph: { type: 'website', title, description, locale: 'ru_RU' },
  };
}

export function clientViewport(client: Client): Viewport {
  return { themeColor: client.theme?.accent };
}
