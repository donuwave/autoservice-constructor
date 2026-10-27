'use client';

import { useState } from 'react';
import Icon from './Icon';
import {
  type ResolvedBranch,
  hoursLines,
  telHref,
  telegramHref,
  whatsappHref,
  yandexMapEmbed,
  yandexRouteHref,
} from '../lib/client';
import s from './Contacts.module.css';

type Props = {
  name: string;
  branches: ResolvedBranch[];
  telegram?: string;
  whatsapp?: string;
};

export default function Contacts({ name, branches, telegram, whatsapp }: Props) {
  const [current, setCurrent] = useState(0);
  const multi = branches.length > 1;
  const b = branches[current];
  const lines = hoursLines(b.hours);

  return (
    <section className={`section ${s.contacts}`} id="contacts" aria-labelledby="contacts-title">
      <div className={`wrap ${s.grid}`}>
        <div>
          <h2 id="contacts-title">{multi ? 'Наши адреса' : 'Как добраться'}</h2>

          {multi && (
            <div className={s.branches} role="radiogroup" aria-label="Выберите филиал">
              {branches.map((x, i) => (
                <button
                  key={x.id}
                  type="button"
                  role="radio"
                  aria-checked={i === current}
                  className={`${s.branch} ${i === current ? s.branchOn : ''}`}
                  onClick={() => setCurrent(i)}
                >
                  <strong>{x.name}</strong>
                  {x.city && <span>{x.city}</span>}
                </button>
              ))}
            </div>
          )}

          <p className={s.address}>
            {b.address}
            {b.city && `, ${b.city}`}
          </p>
          {b.addressNote && <p className={s.muted}>{b.addressNote}</p>}

          <a className={`btn btn-secondary ${s.route}`} href={yandexRouteHref(b.coords)} target="_blank" rel="noopener">
            <Icon name="route" />
            Построить маршрут
          </a>

          <h3>Часы работы</h3>
          <dl className={s.hours}>
            {lines.map((l) => (
              <div key={l.days}>
                <dt>{l.days}</dt>
                <dd className={l.time === 'выходной' ? s.off : undefined}>{l.time}</dd>
              </div>
            ))}
          </dl>

          <h3>Связаться</h3>
          <ul className={s.links}>
            <li>
              <a href={telHref(b.phone)}>
                <Icon name="phone" />
                {b.phone}
              </a>
            </li>
            {telegram && (
              <li>
                <a href={telegramHref(telegram)} target="_blank" rel="noopener">
                  <Icon name="telegram" />
                  Написать в Telegram
                </a>
              </li>
            )}
            {whatsapp && (
              <li>
                <a href={whatsappHref(whatsapp)} target="_blank" rel="noopener">
                  <Icon name="whatsapp" />
                  Написать в WhatsApp
                </a>
              </li>
            )}
          </ul>
        </div>

        <div className={s.map}>
          <iframe
            key={b.id}
            src={yandexMapEmbed(b.coords)}
            title={`${name}: ${b.address} на карте`}
            loading="lazy"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
