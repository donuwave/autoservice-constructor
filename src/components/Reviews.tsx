import Icon from './Icon';
import { type Client, plural } from '../lib/client';
import s from './Reviews.module.css';

export default function Reviews({ client }: { client: Client }) {
  const reviews = client.reviews.slice(0, 4);
  if (reviews.length === 0) return null;
  const { rating } = client;

  return (
    <section className="section" id="reviews" aria-labelledby="reviews-title">
      <div className="wrap">
        <div className="section-head">
          <h2 id="reviews-title">Отзывы</h2>
          {rating && (
            <p>
              {rating.value.toFixed(1).replace('.', ',')} из 5 на {rating.source}, {rating.count}{' '}
              {plural(rating.count, 'отзыв', 'отзыва', 'отзывов')}.{' '}
              {rating.url && (
                <a href={rating.url} target="_blank" rel="noopener">
                  Читать все
                </a>
              )}
            </p>
          )}
        </div>

        <div className={s.grid}>
          {reviews.map((r) => (
            <figure key={r.author + r.text}>
              <div className={s.stars} role="img" aria-label={`Оценка ${r.rating} из 5`}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Icon key={i} name="star" className={i < r.rating ? s.on : s.off} />
                ))}
              </div>
              <blockquote>
                <p>{r.text}</p>
              </blockquote>
              <figcaption>
                <strong>{r.author}</strong>
                {(r.date || r.source) && <span>{[r.date, r.source].filter(Boolean).join(', ')}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
