'use client';

import { useEffect } from 'react';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <main className="route-state-page">
    <div><IconAlertTriangle size={34} /><span>CARSHARE</span><h1>Something went wrong</h1><p>Your saved cars and reservations remain on this device.</p><button type="button" onClick={reset}><IconRefresh size={18} />Try again</button></div>
  </main>;
}
