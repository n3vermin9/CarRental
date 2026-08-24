'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type Car = { id: number; name: string; type: string; plate: string; range: number; price: number; walk: number; color: string; x: number; y: number };
const cars: Car[] = [
  { id: 1, name: 'Mini Cooper SE', type: 'Electric', plate: 'M482OP', range: 186, price: 8.9, walk: 2, color: '#d8ff52', x: 65, y: 24 },
  { id: 2, name: 'Volkswagen ID.3', type: 'Electric', plate: 'K913TA', range: 247, price: 10.4, walk: 4, color: '#b9a7ff', x: 26, y: 46 },
  { id: 3, name: 'Kia Rio', type: 'Comfort', plate: 'A227KC', range: 412, price: 7.2, walk: 6, color: '#ff9c7d', x: 72, y: 66 },
  { id: 4, name: 'Haval Jolion', type: 'SUV', plate: 'P605YT', range: 364, price: 12.5, walk: 8, color: '#7ee8ff', x: 38, y: 79 },
];
const filters = ['All cars', 'Electric', 'Comfort', 'SUV'];

export default function Home() {
  const [signedIn, setSignedIn] = useState(false);
  const [email, setEmail] = useState('developer@carshare.local');
  const [filter, setFilter] = useState('All cars');
  const [selectedId, setSelectedId] = useState(1);
  const [reserved, setReserved] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const visibleCars = useMemo(() => cars.filter((car) => filter === 'All cars' || car.type === filter), [filter]);
  const selected = cars.find((car) => car.id === selectedId) ?? cars[0];

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
      <section className="map" aria-label="Map of nearby cars">
        <div className="orb orb-one" /><div className="orb orb-two" /><div className="dot-grid" />
        <div className="road road-a" /><div className="road road-b" /><div className="road road-c" />
        <div className="block block-a" /><div className="block block-b" /><div className="block block-c" />
        <header className="topbar">
          <div className="brand"><span className="brand-mark">C</span><span>car<span>share</span></span></div>
          <button className="profile" aria-label="Sign out of development app" title="Sign out" onClick={signOut}>N</button>
        </header>
        <div className="search-wrap">
          <label className="search"><span aria-hidden="true">⌕</span><input aria-label="Search destination" placeholder="Where are you going?" /></label>
          <button className="locate" aria-label="Find my location">◎</button>
        </div>
        <div className="filters" aria-label="Vehicle filters">
          {filters.map((item) => <button key={item} className={filter === item ? 'filter active' : 'filter'} onClick={() => selectFilter(item)}>{item === 'Electric' && <span aria-hidden="true">⚡</span>}{item}</button>)}
        </div>
        {visibleCars.map((car) => (
          <button key={car.id} className={car.id === selectedId ? 'car-pin selected' : 'car-pin'} style={{ left: `${car.x}%`, top: `${car.y}%`, '--pin-color': car.color } as React.CSSProperties} onClick={() => { setSelectedId(car.id); setReserved(false); }} aria-label={`${car.name}, ${car.walk} minute walk`}>
            <span className="pin-icon">⌁</span><strong>₽{car.price}</strong>
          </button>
        ))}
        <button className="map-control" aria-label="Center map">⌖</button>
      </section>

      <section className={listOpen ? 'sheet open' : 'sheet'} aria-label="Selected vehicle">
        <button className="sheet-handle" onClick={() => setListOpen(!listOpen)} aria-label={listOpen ? 'Collapse vehicle list' : 'Expand vehicle list'}><span /></button>
        <div className="availability"><span className="pulse" /> {visibleCars.length} cars nearby <span>— ready when you are ✨</span></div>
        <div className="car-card">
          <div className="car-copy"><div className="eyebrow"><span className="electric-dot">⚡</span>{selected.type}</div><h1>{selected.name}</h1><p>{selected.plate} · {selected.walk} min walk</p></div>
          <div className="car-visual" style={{ '--car-color': selected.color } as React.CSSProperties}><div className="car-window" /><div className="car-body" /><span className="wheel one" /><span className="wheel two" /></div>
        </div>
        <div className="stats">
          <div><span>Range</span><strong>{selected.range} km</strong></div><div><span>Rate</span><strong>₽{selected.price}<small>/min</small></strong></div><div><span>Fuel</span><strong>{selected.type === 'Electric' ? '82%' : '74%'}</strong></div>
        </div>
        <button className={reserved ? 'reserve reserved' : 'reserve'} onClick={() => setReserved(!reserved)}><span>{reserved ? 'Car reserved — 15:00' : 'Reserve this car'}</span><span className="arrow">→</span></button>
        <nav className="bottom-nav" aria-label="Main navigation"><button className="nav-active"><span>⌖</span>Explore</button><button><span>▤</span>Trips</button><button><span>♡</span>Saved</button><button><span>○</span>Account</button></nav>
      </section>
    </main>
  );
}
