import Icon from './Icon';
import { type Client, telHref, getBranches } from '../lib/client';
import s from './Footer.module.css';

export default function Footer({ client }: { client: Client }) {
  const year = new Date().getFullYear();
  const branches = getBranches(client);

  return (
    <>
      <footer className={s.footer}>
        <div className={`wrap ${s.row}`}>
          <p>
            <strong>{client.name}</strong>, автосервис
            <br />
            {branches.map((b) => (
              <span key={b.id} className={s.addr}>
                {b.address}
                {b.city && `, ${b.city}`}
              </span>
            ))}
          </p>
          <p className={s.right}>
            <a href={telHref(client.phone)}>{client.phone}</a>
            <br />
            <span>© {year}</span>
          </p>
        </div>
      </footer>

      {/* Панель с кнопками внизу экрана на телефоне */}
      <nav className={s.mobileBar} aria-label="Быстрые действия">
        <a className="btn btn-primary" href={telHref(client.phone)}>
          <Icon name="phone" />
          Позвонить
        </a>
        <a className="btn btn-secondary" href="#booking">
          <Icon name="calendar" />
          Записаться
        </a>
      </nav>
    </>
  );
}
