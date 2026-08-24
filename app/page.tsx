'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { IconArrowLeft, IconBattery, IconCar, IconChevronRight, IconGauge, IconHeart, IconMapPin, IconRoute, IconShieldCheck, IconUsers, IconUser } from '@tabler/icons-react';

type Car = { id: number; name: string; type: string; plate: string; range: number; price: number; walk: number; color: string; image: string; x: number; y: number };
const cars: Car[] = [
  { id: 1, name: 'Mini Cooper SE', type: 'Electric', plate: 'M482OP', range: 186, price: 8.9, walk: 2, color: '#d8ff52', image: 'https://img-cdn.evfy.in/products/P90357227_highRes_the-new-mini-cooper-.jpg', x: 65, y: 38 },
  { id: 2, name: 'Volkswagen ID.3', type: 'Electric', plate: 'K913TA', range: 247, price: 10.4, walk: 4, color: '#b9a7ff', image: 'https://vw.media-corner.ch/sites/default/files/styles/full_image/public/media/images/2021-05/VW_ID3_Erfolg.jpg', x: 26, y: 51 },
  { id: 3, name: 'Kia Rio', type: 'Comfort', plate: 'A227KC', range: 412, price: 7.2, walk: 6, color: '#ff9c7d', image: 'https://kiaonesaw.com/colores/rio/rio_white.jpg', x: 72, y: 67 },
  { id: 4, name: 'Haval Jolion', type: 'SUV', plate: 'P605YT', range: 364, price: 12.5, walk: 8, color: '#7ee8ff', image: 'https://news-site-za.s3.af-south-1.amazonaws.com/images/2021/05/jolion-003.jpg', x: 38, y: 76 },
];
const filters = ['All cars', 'Electric', 'Comfort', 'SUV'];
const tabs = [
  { id: 'explore', label: 'Explore', icon: IconCar },
  { id: 'trips', label: 'Trips', icon: IconRoute },
  { id: 'saved', label: 'Saved', icon: IconHeart },
  { id: 'account', label: 'Account', icon: IconUser },
] as const;

export default function Home() {
  const [signedIn, setSignedIn] = useState(false);
  const [email, setEmail] = useState('developer@carshare.local');
  const [filter, setFilter] = useState('All cars');
  const [selectedId, setSelectedId] = useState(1);
  const [reserved, setReserved] = useState(false);
  const [activeTab, setActiveTab] = useState<'explore' | 'trips' | 'saved' | 'account'>('explore');
  const [tabDirection, setTabDirection] = useState(0);
  const [detailCarId, setDetailCarId] = useState<number | null>(null);
  const visibleCars = useMemo(() => cars.filter((car) => filter === 'All cars' || car.type === filter), [filter]);
  const detailCar = cars.find((car) => car.id === detailCarId) ?? null;

  useEffect(() => {
    setSignedIn(localStorage.getItem('carshare-dev-session') === 'active');
  }, []);

  function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    localStorage.setItem('carshare-dev-session', 'active');
    setSignedIn(true);
  }

  function signOut() {
    localStorage.removeItem('carshare-dev-session');
    setSignedIn(false);
  }
  function selectFilter(next: string) {
    setFilter(next);
    const first = cars.find((car) => next === 'All cars' || car.type === next);
    if (first) setSelectedId(first.id);
    setReserved(false);
  }
  function switchTab(next: typeof activeTab) {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    const nextIndex = tabs.findIndex((tab) => tab.id === next);
    setTabDirection(nextIndex - currentIndex);
    setDetailCarId(null);
    setActiveTab(next);
  }

  if (!signedIn) {
    return (
      <main className="login-shell">
        <div className="login-orb login-orb-one" /><div className="login-orb login-orb-two" /><div className="login-dots" />
        <section className="login-card" aria-labelledby="login-title">
          <div className="dev-badge"><span>●</span> Development mode</div>
          <div className="login-brand"><span className="brand-mark">C</span><span>car<span>share</span></span></div>
          <h1 id="login-title">Welcome back</h1>
          <p>Use the temporary developer login to explore and test the app.</p>
          <form onSubmit={signIn}>
            <label htmlFor="dev-email">Developer email</label>
            <input id="dev-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
            <label htmlFor="dev-password">Password</label>
            <input id="dev-password" type="password" defaultValue="carshare" required autoComplete="current-password" />
            <button className="login-button" type="submit"><span>Enter development app</span><span className="arrow">→</span></button>
          </form>
          <div className="mock-note"><strong>Mock access only</strong><span>No account is created and no credentials leave this device.</span></div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <AnimatePresence mode="popLayout" initial={false} custom={tabDirection}>
      <motion.div className="tab-stage" key={activeTab} custom={tabDirection} initial={{ x: tabDirection > 0 ? 28 : -28, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: tabDirection > 0 ? -28 : 28, opacity: 0 }} transition={{ duration: .28, ease: [.32, .72, 0, 1] }}>
      {activeTab === 'explore' ? <section className="fleet-page" aria-labelledby="fleet-title">
        <header className="fleet-header">
          <div className="brand"><span className="brand-mark">C</span><span>car<span>share</span></span></div>
          <button className="profile" aria-label="Sign out of development app" title="Sign out" onClick={signOut}>N</button>
        </header>
        <div className="fleet-heading"><div><span className="page-kicker">Grozny · nearby</span><h1 id="fleet-title">Choose your car</h1></div><span className="live-count"><i />{visibleCars.length} available</span></div>
        <label className="fleet-search"><span aria-hidden="true">⌕</span><input aria-label="Search available cars" placeholder="Search model or class" /></label>
        <div className="filters fleet-filters" aria-label="Vehicle filters">
          {filters.map((item) => <button key={item} className={filter === item ? 'filter active' : 'filter'} onClick={() => selectFilter(item)}>{item === 'Electric' && <span aria-hidden="true">⚡</span>}{item}</button>)}
        </div>
        <div className="fleet-list">
          {visibleCars.map((car) => {
            const isReserved = reserved && selectedId === car.id;
            return <article className="fleet-card fleet-card-clickable" key={car.id} role="button" tabIndex={0} onClick={() => setDetailCarId(car.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setDetailCarId(car.id); }} aria-label={`Open details for ${car.name}`}>
              <div className="fleet-image"><img src={car.image} alt={car.name} /><span><IconMapPin size={13} />{car.walk} min walk</span><button aria-label={`Save ${car.name}`} onClick={(event) => event.stopPropagation()}><IconHeart size={19} stroke={1.8} /></button></div>
              <div className="fleet-card-body">
                <div className="fleet-title-row"><div><span>{car.type === 'Electric' ? '⚡ ' : ''}{car.type}</span><h2>{car.name}</h2><small>{car.plate}</small></div><strong>₽{car.price}<small>/min</small></strong></div>
                <div className="fleet-specs"><span><small>Range</small><b>{car.range} km</b></span><span><small>{car.type === 'Electric' ? 'Charge' : 'Fuel'}</small><b>{car.type === 'Electric' ? '82%' : '74%'}</b></span><span><small>Seats</small><b>5</b></span></div>
                <div className="fleet-card-hint"><span>{isReserved ? 'Reserved · 15:00' : 'View full details'}</span><IconChevronRight size={18} stroke={1.8} /></div>
              </div>
            </article>;
          })}
        </div>
        <AnimatePresence>
          {detailCar && <motion.section className="car-detail" aria-labelledby="car-detail-title" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: .34, ease: [.32, .72, 0, 1] }}>
            <div className="detail-hero">
              <img src={detailCar.image} alt={detailCar.name} />
              <div className="detail-scrim" />
              <button className="detail-glass-button detail-back" onClick={() => setDetailCarId(null)} aria-label="Back to available cars"><IconArrowLeft size={23} stroke={2} /></button>
              <button className="detail-glass-button detail-save" aria-label={`Save ${detailCar.name}`}><IconHeart size={22} stroke={1.8} /></button>
              <div className="detail-hero-copy"><span>{detailCar.type === 'Electric' ? '⚡ ' : ''}{detailCar.type}</span><h1 id="car-detail-title">{detailCar.name}</h1><p><IconMapPin size={14} /> {detailCar.walk} min walk · Central Grozny</p></div>
            </div>
            <div className="detail-content">
              <div className="detail-price"><div><span>From</span><strong>₽{detailCar.price}<small>/min</small></strong></div><span className="detail-available"><i />Available now</span></div>
              <div className="detail-metrics">
                <div><IconGauge size={21} /><span>Range<strong>{detailCar.range} km</strong></span></div>
                <div><IconBattery size={21} /><span>{detailCar.type === 'Electric' ? 'Charge' : 'Fuel'}<strong>{detailCar.type === 'Electric' ? '82%' : '74%'}</strong></span></div>
                <div><IconUsers size={21} /><span>Seats<strong>5 people</strong></span></div>
              </div>
              <section className="detail-section"><h2>About this car</h2><p>A clean, comfortable city car with automatic transmission, climate control, phone connectivity, and everything you need for an easy drive around Grozny.</p></section>
              <section className="detail-section"><h2>Included</h2><div className="feature-list"><span><IconShieldCheck size={19} />Comprehensive insurance</span><span><IconCar size={19} />Fuel and city parking</span><span><IconRoute size={19} />24/7 roadside support</span></div></section>
              <section className="detail-section detail-location"><h2>Pickup</h2><div><IconMapPin size={20} /><span><strong>Central Grozny</strong><small>{detailCar.walk} minute walk · exact location after reservation</small></span></div></section>
            </div>
            <div className="detail-action"><button className={reserved && selectedId === detailCar.id ? 'detail-reserve reserved' : 'detail-reserve'} onClick={() => { const isCurrent = reserved && selectedId === detailCar.id; setSelectedId(detailCar.id); setReserved(!isCurrent); }}><span>{reserved && selectedId === detailCar.id ? 'Reserved until 15:00' : 'Reserve this car'}</span><b>{reserved && selectedId === detailCar.id ? '✓' : `₽${detailCar.price}/min`}</b></button></div>
          </motion.section>}
        </AnimatePresence>
      </section> : (
        <section className="tab-page" aria-labelledby={`${activeTab}-title`}>
          <header className="page-header"><div><span className="page-kicker">CarShare</span><h1 id={`${activeTab}-title`}>{activeTab === 'trips' ? 'Your trips' : activeTab === 'saved' ? 'Saved cars' : 'Your account'}</h1></div><button className="profile" aria-label="Sign out of development app" title="Sign out" onClick={signOut}>N</button></header>

          {activeTab === 'trips' && <div className="page-content">
            <section className="summary-card"><span>August activity</span><strong>3 trips</strong><p>42 minutes · ₽386 total</p></section>
            <h2>Recent</h2>
            <article className="trip-card"><div className="trip-icon">✓</div><div><strong>Volkswagen ID.3</strong><span>Today, 14:22 · 18 min</span><small>Grozny Mall → Minutka Square</small></div><b>₽187</b></article>
            <article className="trip-card"><div className="trip-icon">✓</div><div><strong>Mini Cooper SE</strong><span>22 Aug, 19:08 · 11 min</span><small>Putin Avenue → Flower Park</small></div><b>₽98</b></article>
          </div>}

          {activeTab === 'saved' && <div className="page-content">
            <p className="page-lead">Your favorite cars around Grozny, ready to find again.</p>
            {cars.slice(0,2).map((car) => <article className="saved-card" key={car.id}><img src={car.image} alt={car.name} /><div><span>{car.type}</span><strong>{car.name}</strong><small>{car.range} km range · ₽{car.price}/min</small><button onClick={() => { setSelectedId(car.id); switchTab('explore'); }}>View car <b>→</b></button></div></article>)}
          </div>}

          {activeTab === 'account' && <div className="page-content">
            <section className="account-card"><div className="account-avatar">N</div><div><strong>NVR Developer</strong><span>developer@carshare.local</span><small>Development account</small></div></section>
            <h2>Preferences</h2>
            <div className="settings-list"><button><span>◉</span><div><strong>Payment method</strong><small>Mock card ·· 4242</small></div><b>›</b></button><button><span>♢</span><div><strong>Driving documents</strong><small>Verified for development</small></div><b>›</b></button><button><span>☾</span><div><strong>Appearance</strong><small>iOS dark</small></div><b>›</b></button></div>
            <button className="signout-button" onClick={signOut}>Sign out of development app</button>
          </div>}
        </section>
      )}
      </motion.div>
      </AnimatePresence>

      {!detailCar && <nav className="bottom-nav" aria-label="Main navigation">
        {tabs.map((tab) => { const Icon = tab.icon; const isActive = activeTab === tab.id; return <motion.button key={tab.id} className={isActive ? 'nav-active' : ''} onClick={() => switchTab(tab.id)} aria-current={isActive ? 'page' : undefined} whileTap={{ scale: .9 }} transition={{ type: 'spring', stiffness: 520, damping: 28 }}>
          {isActive && <motion.span className="nav-active-pill" layoutId="nav-active-pill" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
          <motion.span className="nav-icon" animate={{ scale: isActive ? 1.14 : 1, y: isActive ? -1 : 0 }} transition={{ type: 'spring', stiffness: 480, damping: 24 }}><Icon size={23} stroke={1.75} /></motion.span><small>{tab.label}</small>
        </motion.button>; })}
      </nav>}
    </main>
  );
}
