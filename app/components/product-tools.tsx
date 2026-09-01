'use client';

import { type FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import {
  IconAlertTriangle, IconBellRinging, IconCheck, IconDownload, IconExternalLink,
  IconMap2, IconMessageCircle, IconPhoto, IconSend, IconStar, IconX,
} from '@tabler/icons-react';
import type { Trip } from '../carshare-domain';

const productSpring = { type: 'spring' as const, stiffness: 420, damping: 38, mass: .86 };
const groznyCoordinates = '43.3187,45.6946';

export function openPickupNavigation() {
  window.open(`https://maps.apple.com/?daddr=${groznyCoordinates}&dirflg=d`, '_blank', 'noopener,noreferrer');
}

export function PickupNavigationButton({ locale, label }: { locale: 'en' | 'ru'; label?: string }) {
  return <motion.button type="button" className="secondary-product-action" whileTap={{ scale: .98 }} onClick={openPickupNavigation}><IconMap2 size={19} />{label ?? (locale === 'ru' ? 'Маршрут к автомобилю' : 'Navigate to car')}<IconExternalLink size={16} /></motion.button>;
}

export function NotificationPermissionRow({ locale, onStatus }: { locale: 'en' | 'ru'; onStatus: (message: string) => void }) {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const enable = async () => {
    if (!('Notification' in window)) return onStatus(locale === 'ru' ? 'Уведомления не поддерживаются' : 'Notifications are not supported');
    const next = await Notification.requestPermission();
    setPermission(next);
    if (next === 'granted') {
      onStatus(locale === 'ru' ? 'Уведомления включены' : 'Notifications enabled');
      new Notification('CarShare', { body: locale === 'ru' ? 'Напоминания об аренде включены.' : 'Rental reminders are enabled.' });
    } else onStatus(locale === 'ru' ? 'Разрешение не предоставлено' : 'Permission was not granted');
  };
  const enabled = permission === 'granted';
  return <button className="notification-permission-row" type="button" onClick={enable} disabled={enabled || permission === 'unsupported'}><span className="row-icon notification"><IconBellRinging size={18} /></span><div><strong>{locale === 'ru' ? 'Push-уведомления' : 'Push notifications'}</strong><small>{enabled ? (locale === 'ru' ? 'Включены' : 'Enabled') : permission === 'unsupported' ? (locale === 'ru' ? 'Недоступны' : 'Unavailable') : (locale === 'ru' ? 'Напоминания о получении и возврате' : 'Pickup and return reminders')}</small></div>{enabled ? <IconCheck className="notification-permission-check" size={18} /> : <b className="settings-value">{locale === 'ru' ? 'Включить' : 'Enable'}</b>}</button>;
}

export function SupportSheet({ locale, onClose }: { locale: 'en' | 'ru'; onClose: () => void }) {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState<string[]>([]);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next = message.trim();
    if (!next) return;
    setSent((current) => [...current, next]);
    setMessage('');
  };
  return <div className="reservation-overlay feature-overlay product-overlay" onClick={onClose}>
    <motion.section className="feature-sheet product-sheet" role="dialog" aria-modal="true" aria-labelledby="support-title" initial={{ y: 28, opacity: 0, scale: .985 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 18, opacity: 0 }} transition={productSpring} onClick={(event) => event.stopPropagation()}>
      <header className="feature-sheet-header"><div><span>CARSHARE HELP</span><h2 id="support-title">{locale === 'ru' ? 'Поддержка' : 'Support'}</h2></div><button type="button" onClick={onClose} aria-label={locale === 'ru' ? 'Закрыть' : 'Close'}><IconX size={21} /></button></header>
      <div className="support-thread" aria-live="polite"><article><span><IconMessageCircle size={18} /></span><p>{locale === 'ru' ? 'Здравствуйте! Опишите вопрос — ответ появится здесь, а срочные проблемы можно решить по телефону.' : 'Hi! Describe your question here. For urgent rental issues, call support.'}</p></article>{sent.map((item, index) => <article className="mine" key={`${item}-${index}`}><p>{item}</p></article>)}</div>
      <form className="support-composer" onSubmit={submit}><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder={locale === 'ru' ? 'Сообщение поддержке' : 'Message support'} aria-label={locale === 'ru' ? 'Сообщение поддержке' : 'Message support'} /><button type="submit" aria-label={locale === 'ru' ? 'Отправить' : 'Send'}><IconSend size={19} /></button></form>
      <a className="secondary-product-action" href="tel:+78005553535"><IconMessageCircle size={19} />{locale === 'ru' ? 'Позвонить в поддержку' : 'Call support'}<span>24/7</span></a>
    </motion.section>
  </div>;
}

export function DamageReportSheet({ locale, onClose, onSaved }: { locale: 'en' | 'ru'; onClose: () => void; onSaved: (summary: string) => void }) {
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('minor');
  const [fileCount, setFileCount] = useState(0);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (description.trim().length < 5) return;
    onSaved(`${severity}: ${description.trim()} (${fileCount} photos)`);
  };
  return <div className="reservation-overlay feature-overlay product-overlay" onClick={onClose}>
    <motion.section className="feature-sheet product-sheet damage-sheet" role="dialog" aria-modal="true" aria-labelledby="damage-title" initial={{ y: 28, opacity: 0, scale: .985 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 18, opacity: 0 }} transition={productSpring} onClick={(event) => event.stopPropagation()}>
      <header className="feature-sheet-header"><div><span>CARSHARE SAFETY</span><h2 id="damage-title">{locale === 'ru' ? 'Сообщить о повреждении' : 'Report damage'}</h2></div><button type="button" onClick={onClose} aria-label={locale === 'ru' ? 'Закрыть' : 'Close'}><IconX size={21} /></button></header>
      <form className="damage-form" onSubmit={submit}><div className="damage-severity" role="group" aria-label={locale === 'ru' ? 'Степень повреждения' : 'Damage severity'}>{[['minor', locale === 'ru' ? 'Небольшое' : 'Minor'], ['major', locale === 'ru' ? 'Серьёзное' : 'Major']].map(([value, label]) => <button type="button" key={value} className={severity === value ? 'active' : ''} aria-pressed={severity === value} onClick={() => setSeverity(value)}>{label}</button>)}</div><label>{locale === 'ru' ? 'Что произошло' : 'What happened'}<textarea value={description} minLength={5} required onChange={(event) => setDescription(event.target.value)} placeholder={locale === 'ru' ? 'Опишите место и повреждение' : 'Describe the location and damage'} /></label><label className="photo-input"><IconPhoto size={20} /><span>{fileCount ? `${fileCount} ${locale === 'ru' ? 'фото выбрано' : 'photos selected'}` : (locale === 'ru' ? 'Добавить фотографии' : 'Add photos')}</span><input type="file" accept="image/*" capture="environment" multiple onChange={(event) => setFileCount(event.target.files?.length ?? 0)} /></label><button className="primary-action" type="submit"><IconAlertTriangle size={19} />{locale === 'ru' ? 'Отправить отчёт' : 'Submit report'}</button></form>
    </motion.section>
  </div>;
}

export function RatingControl({ locale, value, onChange }: { locale: 'en' | 'ru'; value: number; onChange: (value: number) => void }) {
  return <div className="rating-control" role="group" aria-label={locale === 'ru' ? 'Оценка поездки' : 'Trip rating'}>{[1, 2, 3, 4, 5].map((rating) => <motion.button type="button" key={rating} whileTap={{ scale: .86 }} aria-label={`${rating} ${locale === 'ru' ? 'звёзд' : 'stars'}`} aria-pressed={value === rating} onClick={() => onChange(rating)}><IconStar size={23} fill={rating <= value ? 'currentColor' : 'none'} /></motion.button>)}</div>;
}

export function ReceiptDownloadButton({ trip, locale }: { trip: Trip; locale: 'en' | 'ru' }) {
  const download = () => {
    const title = `CarShare · ${trip.car}`;
    const body = `<!doctype html><meta charset="utf-8"><title>${title}</title><style>body{font:16px -apple-system,BlinkMacSystemFont,sans-serif;max-width:640px;margin:48px auto;color:#111}h1{font-size:28px}dl{display:grid;grid-template-columns:1fr auto;gap:14px;border-top:1px solid #ddd;padding-top:20px}dt{color:#666}dd{font-weight:700}.total{font-size:22px}</style><h1>${title}</h1><p>${trip.date} ${trip.time} → ${trip.endDate} ${trip.endTime}</p><dl><dt>Rental</dt><dd>₽${trip.rentalFee.toLocaleString('ru-RU')}</dd><dt>Extras</dt><dd>₽${trip.extras.toLocaleString('ru-RU')}</dd><dt class="total">Total</dt><dd class="total">₽${trip.price.toLocaleString('ru-RU')}</dd></dl>`;
    const url = URL.createObjectURL(new Blob([body], { type: 'text/html;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `CarShare-receipt-${trip.id}.html`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  return <motion.button type="button" className="secondary-product-action" whileTap={{ scale: .98 }} onClick={download}><IconDownload size={19} />{locale === 'ru' ? 'Скачать квитанцию' : 'Download receipt'}</motion.button>;
}
