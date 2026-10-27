// С CLIENT в .env — сайт этого клиента. Без него — служебный список демо.
import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Landing from '../components/Landing';
import { getClients, getMainClient } from '../lib/clients';
import { clientMetadata, clientViewport } from '../lib/seo';
import s from './page.module.css';

export function generateMetadata(): Metadata {
  const main = getMainClient();
  return main ? clientMetadata(main) : { title: 'Демо автосервисов', robots: { index: false, follow: false } };
}

export function generateViewport(): Viewport {
  const main = getMainClient();
  return main ? clientViewport(main) : {};
}

export default function Home() {
  const main = getMainClient();
  if (main) return <Landing client={main} />;
  // Список демо нужен только при разработке: в продакшене не показываем чужие лиды
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <main className={`wrap ${s.list}`}>
      <h1>Демо-сайты</h1>
      <p>Ссылку на страницу можно отправлять владельцу сервиса.</p>
      <ul>
        {getClients().map((c) => (
          <li key={c.slug}>
            <Link href={`/${c.slug}`}>{c.name}</Link>
            <span>{c.address}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
