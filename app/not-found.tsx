import Link from 'next/link';
import { IconArrowLeft, IconCarOff } from '@tabler/icons-react';

export default function NotFound() {
  return <main className="route-state-page">
    <div><IconCarOff size={34} /><span>CARSHARE</span><h1>Page not found</h1><p>This car or page is no longer available.</p><Link href="/explore"><IconArrowLeft size={18} />Explore cars</Link></div>
  </main>;
}
