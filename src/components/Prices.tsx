import { type Client, formatPrice } from '../lib/client';
import s from './Prices.module.css';

export default function Prices({ client }: { client: Client }) {
  return (
    <section className="section" id="prices" aria-labelledby="prices-title">
      <div className="wrap">
        <div className="section-head">
          <h2 id="prices-title">Услуги и цены</h2>
          {client.pricesNote && <p>{client.pricesNote}</p>}
        </div>

        <div className={s.groups}>
          {client.services.map((group) => (
            <div className={s.group} key={group.title}>
              <h3>{group.title}</h3>
              <table>
                <tbody>
                  {group.items.map((item) => (
                    <tr key={item.name}>
                      <th scope="row">
                        {item.name}
                        {item.note && <span className={s.note}>{item.note}</span>}
                      </th>
                      <td className={item.price === null ? s.onRequest : undefined}>{formatPrice(item)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
