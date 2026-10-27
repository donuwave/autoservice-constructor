import Plate from './Plate';
import Icon from './Icon';
import OpenStatus from './OpenStatus';
import { type Client, telHref, hoursShort, formatPrice, plural, getBranches, sameHours, citiesLabel } from '../lib/client';
import s from './Hero.module.css';

export default function Hero({ client }: { client: Client }) {
  const branches = getBranches(client);
  const multi = branches.length > 1;
  const main = branches[0];
  const common = sameHours(branches);
  const popular = client.services
    .flatMap((g) => g.items)
    .filter((i) => i.popular)
    .slice(0, 4);

  return (
    <header className={s.hero}>
      <div className={`wrap ${s.heroGrid}`}>
        <div className={s.heroMain}>
          <Plate text={client.plateText ?? client.name} region={client.region} />
          <h1>{client.headline}</h1>
          {client.lead && <p className={s.lead}>{client.lead}</p>}

          <ul className={s.facts}>
            <li>
              <Icon name="pin" />
              {multi ? (
                <span>
                  {branches.length} {plural(branches.length, 'филиал', 'филиала', 'филиалов')}
                  <span className={s.muted}>: {citiesLabel(branches)}. </span>
                  <a href="#contacts">Все адреса</a>
                </span>
              ) : (
                <span>
                  {main.address}
                  {main.city && <span className={s.muted}>, {main.city}</span>}
                </span>
              )}
            </li>
            <li>
              <Icon name="clock" />
              <span>
                {common ? (
                  <>
                    <OpenStatus hours={main.hours} />
                    <span className={`${s.muted} ${s.hoursText}`}>{hoursShort(main.hours)}</span>
                  </>
                ) : (
                  <span className={s.muted}>График у каждого филиала свой, смотрите ниже</span>
                )}
              </span>
            </li>
            {client.rating && (
              <li>
                <Icon name="star" className={s.star} />
                <span>
                  Рейтинг <strong>{client.rating.value.toFixed(1).replace('.', ',')}</strong> на {client.rating.source}
                  <span className={s.muted}>
                    , {client.rating.count} {plural(client.rating.count, 'отзыв', 'отзыва', 'отзывов')}
                  </span>
                </span>
              </li>
            )}
          </ul>

          <div className={s.actions}>
            <a className="btn btn-primary" href={telHref(client.phone)}>
              <Icon name="phone" />
              Позвонить
              <span className={s.btnPhone}>{client.phone}</span>
            </a>
            <a className="btn btn-secondary" href="#booking">
              <Icon name="calendar" />
              Записаться онлайн
            </a>
          </div>
        </div>

        {popular.length > 0 && (
          <aside className={s.priceBoard} aria-labelledby="popular-title">
            <h2 id="popular-title">Частые работы</h2>
            <ul>
              {popular.map((item) => (
                <li key={item.name}>
                  <span>{item.name}</span>
                  <span className={s.dots} aria-hidden="true" />
                  <strong>{formatPrice(item)}</strong>
                </li>
              ))}
            </ul>
            <a href="#prices">Весь прайс</a>
          </aside>
        )}
      </div>
    </header>
  );
}
