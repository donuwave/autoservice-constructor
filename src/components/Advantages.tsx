import type { Client } from '../lib/client';
import s from './Advantages.module.css';

export default function Advantages({ client }: { client: Client }) {
  if (client.advantages.length === 0) return null;

  return (
    <section className={`section ${s.advantages}`} aria-labelledby="why-title">
      <div className="wrap">
        <h2 id="why-title">Почему едут к нам</h2>
        <div className={s.list}>
          {client.advantages.map((a) => (
            <article key={a.title}>
              <h3>{a.title}</h3>
              <p>{a.text}</p>
              {a.quote && (
                <blockquote>
                  <p>«{a.quote.text}»</p>
                  <cite>{a.quote.author}, из отзыва</cite>
                </blockquote>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
