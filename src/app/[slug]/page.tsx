// Демо-страница каждого клиента: /stupica, /time-service и т.д.
// Закрыта от поисковиков: у боевого сайта клиента страница живёт на главной (CLIENT в .env).
import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import Landing from '../../components/Landing';
import { getClient, getClients } from '../../lib/clients';
import { clientMetadata, clientViewport } from '../../lib/seo';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getClients().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const client = getClient((await params).slug);
  return client ? clientMetadata(client, { noindex: true }) : {};
}

export async function generateViewport({ params }: Props): Promise<Viewport> {
  const client = getClient((await params).slug);
  return client ? clientViewport(client) : {};
}

export default async function ClientPage({ params }: Props) {
  const client = getClient((await params).slug);
  if (!client) notFound();
  return <Landing client={client} />;
}
