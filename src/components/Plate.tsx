import type { CSSProperties } from 'react';
import s from './Plate.module.css';

// Название сервиса в виде российского номерного знака
export default function Plate({ text, region = '52' }: { text: string; region?: string }) {
  const label = text.toUpperCase();
  // Длина нужна, чтобы длинные названия ужимались и влезали в ширину телефона
  const len = Math.max(label.length, 5);

  return (
    <div className={s.plate} style={{ '--len': len } as CSSProperties} role="img" aria-label={text}>
      <span className={s.text}>{label}</span>
      <span className={s.region} aria-hidden="true">
        <span className={s.regionNum}>{region}</span>
        <span className={s.regionRus}>
          RUS
          <span className={s.flag}>
            <i />
            <i />
            <i />
          </span>
        </span>
      </span>
    </div>
  );
}
