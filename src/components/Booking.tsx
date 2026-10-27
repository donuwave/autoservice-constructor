'use client';

import { useRef, useState, type FormEvent } from 'react';
import Icon from './Icon';
import { type Client, telHref } from '../lib/client';
import s from './Booking.module.css';

const whenOptions = ['Сегодня', 'Завтра', 'На этой неделе', 'Не срочно'];

type Props = Pick<Client, 'slug' | 'phone'> & {
  branches: { id: string; name: string }[];
  successText?: string;
};

export default function Booking({ slug, phone, branches, successText }: Props) {
  const success = successText ?? 'Перезвоним в рабочее время, чтобы подтвердить запись.';
  const [when, setWhen] = useState(whenOptions[0]);
  const [branch, setBranch] = useState(branches[0]?.name ?? '');
  const [phoneInvalid, setPhoneInvalid] = useState(false);
  const [failed, setFailed] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const phoneRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  const phoneOk = (v: string) => v.replace(/\D/g, '').length >= 10;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFailed(false);

    if (!phoneOk(phoneRef.current?.value ?? '')) {
      setPhoneInvalid(true);
      phoneRef.current?.focus();
      return;
    }

    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    setSending(true);
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSent(true);
      requestAnimationFrame(() => doneRef.current?.focus());
    } catch {
      setFailed(true);
      setSending(false);
    }
  }

  return (
    <section className="section" id="booking" aria-labelledby="booking-title">
      <div className={`wrap ${s.grid}`}>
        <div className={s.intro}>
          <h2 id="booking-title">Запись на ремонт</h2>
          <p>Опишите, что с машиной, и оставьте телефон. Перезвоним, уточним детали и предложим время.</p>
          <p className={s.call}>
            Быстрее по телефону: <a href={telHref(phone)}>{phone}</a>
          </p>
        </div>

        <div className={s.card}>
          {!sent ? (
            <form onSubmit={onSubmit} noValidate>
              <input type="hidden" name="slug" value={slug} />
              <div className={s.hp} aria-hidden="true">
                <label>
                  Компания <input type="text" name="company" tabIndex={-1} autoComplete="off" />
                </label>
              </div>

              <div className={s.row}>
                <label className={s.field}>
                  <span>Имя</span>
                  <input name="name" type="text" autoComplete="given-name" maxLength={80} />
                </label>
                <label className={s.field}>
                  <span>
                    Телефон <em>обязательно</em>
                  </span>
                  <input
                    ref={phoneRef}
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+7"
                    maxLength={30}
                    required
                    aria-invalid={phoneInvalid || undefined}
                    aria-describedby="phone-error"
                    onChange={(e) => phoneOk(e.target.value) && setPhoneInvalid(false)}
                  />
                  <small className={s.error} id="phone-error" hidden={!phoneInvalid}>
                    Укажите номер, чтобы мы могли перезвонить
                  </small>
                </label>
              </div>

              {branches.length > 1 && (
                <fieldset className={s.field}>
                  <legend>Филиал</legend>
                  <div className={s.chips}>
                    {branches.map((b) => (
                      <label className={s.chip} key={b.id}>
                        <input
                          type="radio"
                          name="branch"
                          value={b.name}
                          checked={branch === b.name}
                          onChange={() => setBranch(b.name)}
                        />
                        <span>{b.name}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

              <label className={s.field}>
                <span>Марка и модель</span>
                <input name="car" type="text" placeholder="Например, Kia Rio 2017" maxLength={80} />
              </label>

              <label className={s.field}>
                <span>Что случилось</span>
                <textarea
                  name="problem"
                  rows={3}
                  maxLength={1000}
                  placeholder="Стучит спереди на кочках, нужен развал, пора менять масло"
                />
              </label>

              <fieldset className={s.field}>
                <legend>Когда удобно приехать</legend>
                <div className={s.chips}>
                  {whenOptions.map((opt) => (
                    <label className={s.chip} key={opt}>
                      <input type="radio" name="when" value={opt} checked={when === opt} onChange={() => setWhen(opt)} />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <button className={`btn btn-primary ${s.submit}`} type="submit" disabled={sending}>
                {sending ? 'Отправляем…' : 'Отправить заявку'}
              </button>
              <p className={s.formError} role="alert" hidden={!failed}>
                Заявка не отправилась. Позвоните нам: <a href={telHref(phone)}>{phone}</a>
              </p>
              <p className={s.consent}>
                Нажимая кнопку, вы соглашаетесь на обработку телефона и имени для связи по заявке.
              </p>
            </form>
          ) : (
            <div className={s.done} ref={doneRef} tabIndex={-1}>
              <span className={s.doneIcon}>
                <Icon name="check" />
              </span>
              <h3>Заявка отправлена</h3>
              <p>{success}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
