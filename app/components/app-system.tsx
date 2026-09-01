'use client';

import Image from 'next/image';
import { IconCheck, IconWifiOff } from '@tabler/icons-react';

export function CarImage({ src, alt, priority = false, sizes = '(max-width: 720px) 42vw, (max-width: 1439px) 33vw, 360px', className = '' }: { src: string; alt: string; priority?: boolean; sizes?: string; className?: string }) {
  return <Image className={className} draggable={false} src={src} alt={alt} width={720} height={450} sizes={sizes} priority={priority} />;
}

export function AppLoading({ label = 'Loading CarShare' }: { label?: string }) {
  return <main className="app-loading" aria-busy="true" aria-label={label}>
    <div className="app-loading-mark"><Image src="/valoar-logo.svg" alt="" width={30} height={30} priority /></div>
    <div className="app-loading-copy"><strong>CarShare</strong><span>{label}</span></div>
    <div className="app-loading-track"><i /></div>
  </main>;
}

export function OfflineBanner({ locale }: { locale: 'en' | 'ru' }) {
  return <div className="offline-banner" role="status" aria-live="polite"><IconWifiOff size={17} />{locale === 'ru' ? 'Нет сети — изменения сохранятся на устройстве' : 'Offline — changes stay saved on this device'}</div>;
}

export function StatusToast({ message }: { message: string }) {
  return <div className="app-toast" role="status" aria-live="polite"><IconCheck size={17} />{message}</div>;
}
