import type { CSSProperties } from 'react';
import Hero from './Hero';
import Prices from './Prices';
import Advantages from './Advantages';
import Reviews from './Reviews';
import Booking from './Booking';
import Contacts from './Contacts';
import Footer from './Footer';
import { type Client, openingHoursSpec, getBranches } from '../lib/client';
import s from './Landing.module.css';

export default function Landing({ client }: { client: Client }) {
  const branches = getBranches(client);
  // По одной записи AutoRepair на филиал
  const jsonLd = branches.map((b) => ({
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    name: branches.length > 1 ? `${client.name}, ${b.name}` : client.name,
    telephone: b.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: b.address,
      addressLocality: b.city,
      addressCountry: 'RU',
    },
    geo: { '@type': 'GeoCoordinates', latitude: b.coords[0], longitude: b.coords[1] },
    openingHoursSpecification: openingHoursSpec(b.hours),
    ...(client.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: client.rating.value,
        reviewCount: client.rating.count,
      },
    }),
  }));

  const accent = client.theme?.accent;

  return (
    <div style={accent ? ({ '--accent': accent } as CSSProperties) : undefined}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      {client.demo?.enabled && (
        <div className={s.demoBar} role="note">
          <div className="wrap">{client.demo.note ?? 'Это пример сайта. Цены и тексты примерные.'}</div>
        </div>
      )}
      <Hero client={client} />
      <main>
        <Prices client={client} />
        <Advantages client={client} />
        <Reviews client={client} />
        <Contacts name={client.name} branches={branches} telegram={client.telegram} whatsapp={client.whatsapp} />
        <Booking
          slug={client.slug}
          phone={client.phone}
          branches={branches.map((b) => ({ id: b.id, name: b.name }))}
          successText={client.booking?.successText} />
      </main>
      <Footer client={client} />
    </div>
  );
}
