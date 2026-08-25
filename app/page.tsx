'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  IconAdjustmentsHorizontal, IconArrowLeft, IconBattery, IconBolt, IconCar,
  IconCheck, IconChevronRight, IconClock, IconCreditCard, IconGauge, IconHeart, IconId,
  IconLogout, IconMapPin, IconMoon, IconNavigation, IconRoute, IconSearch,
  IconShieldCheck, IconUser, IconUsers,
} from '@tabler/icons-react';

type TabId = 'explore' | 'trips' | 'saved' | 'account';
type Car = { id: number; name: string; type: string; electric: boolean; plate: string; range: number; price: number; walk: number; image: string };
type Trip = { id: number; car: string; date: string; time: string; duration: number; distance: number; from: string; to: string; price: number; rate: number; parking: number };

const cars: Car[] = [
  { id: 1, name: 'Mini Cooper SE', type: 'Comfort', electric: true, plate: 'M482OP', range: 186, price: 3900, walk: 2, image: 'https://images.ctfassets.net/6qlrq7zcfmtw/74HkRybSklhmcq8cB0wehs/9a970020ab8d729c279922df8c704167/Electric-hero.png' },
  { id: 2, name: 'Volkswagen ID.3', type: 'Comfort', electric: true, plate: 'K913TA', range: 247, price: 4200, walk: 4, image: 'https://a.storyblok.com/f/284380/1600x900/120de53a42/deepetched-v2-vw-id-3.png' },
  { id: 3, name: 'Kia Rio', type: 'Economy', electric: false, plate: 'A227KC', range: 412, price: 2800, walk: 6, image: 'https://www.pngmart.com/files/22/Kia-Rio-PNG-Photos.png' },
  { id: 4, name: 'Haval Jolion', type: 'Comfort', electric: false, plate: 'P605YT', range: 364, price: 4600, walk: 8, image: 'https://cdn.prod.website-files.com/65cda78206104b9489740184/66276f6bb67f02d02abe40ca_Frame%206.png' },
  { id: 5, name: 'Tesla Model 3', type: 'Business', electric: true, plate: 'E318VX', range: 491, price: 5900, walk: 9, image: 'https://www.pngmart.com/files/22/Tesla-Model-3-PNG-Photo.png' },
  { id: 6, name: 'Toyota Camry', type: 'Business', electric: false, plate: 'T704AM', range: 610, price: 4400, walk: 11, image: 'https://www.pngmart.com/files/10/White-Toyota-Camry-PNG-File.png' },
  { id: 7, name: 'BMW X1', type: 'Business', electric: false, plate: 'B151MX', range: 526, price: 6800, walk: 13, image: 'https://www.bmw.com.br/content/dam/bmw/marketBR/bmw_com_br/all-models/model-cards/BMW%20X1.png' },
  { id: 8, name: 'Hyundai Elantra', type: 'Economy', electric: false, plate: 'H809CA', range: 575, price: 3300, walk: 15, image: 'https://www.pngitem.com/pimgs/m/491-4919876_car-background-hyundai-transparent-2016-hyundai-elantra-white.png' },
  { id: 9, name: 'LADA Vesta', type: 'Economy', electric: false, plate: 'B737CT', range: 548, price: 3200, walk: 5, image: 'https://pngimg.com/uploads/lada/lada_PNG104.png' },
  { id: 10, name: 'Moskvich 3', type: 'Comfort', electric: false, plate: 'M303CK', range: 505, price: 4500, walk: 7, image: 'https://cars.moskvich.ru/uploads/bd778396-a03c-11f0-a802-d00de8041c50.png' },
  { id: 11, name: 'AURUS Senat', type: 'Business', electric: false, plate: 'A001AA', range: 620, price: 14500, walk: 16, image: 'https://aurus-avtodom.ru/upload/uf/b26/c673sjbveypvh6bso500f5sumwh02scc.png' },
];
const filters = ['All', 'Economy', 'Comfort', 'Business'];
const trips: Trip[] = [
  { id: 1, car: 'Volkswagen ID.3', date: 'Today', time: '14:22', duration: 18, distance: 9.4, from: 'Grozny Mall', to: 'Minutka Square', price: 187, rate: 176, parking: 11 },
  { id: 2, car: 'Mini Cooper SE', date: '22 Aug', time: '19:08', duration: 11, distance: 5.7, from: 'Putin Avenue', to: 'Flower Park', price: 98, rate: 98, parking: 0 },
  { id: 3, car: 'Kia Rio', date: '18 Aug', time: '10:41', duration: 13, distance: 7.1, from: 'Grozny City', to: 'Airport District', price: 101, rate: 94, parking: 7 },
];
const tabs = [
  { id: 'explore', label: 'Explore', icon: IconCar },
  { id: 'trips', label: 'Trips', icon: IconRoute },
  { id: 'saved', label: 'Saved', icon: IconHeart },
  { id: 'account', label: 'Account', icon: IconUser },
] as const;
const spring = { type: 'spring' as const, bounce: 0, duration: 0.38 };

export default function Home() {
  const reduceMotion = useReducedMotion();
  const [signedIn, setSignedIn] = useState(false);
  const [email, setEmail] = useState('developer@carshare.local');
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('explore');
  const [tabDirection, setTabDirection] = useState(0);
  const [detailCarId, setDetailCarId] = useState<number | null>(null);
  const [reservedId, setReservedId] = useState<number | null>(null);
  const [savedIds, setSavedIds] = useState<number[]>([1, 2]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setSignedIn(localStorage.getItem('carshare-dev-session') === 'active'));
    return () => cancelAnimationFrame(frame);
  }, []);
  const visibleCars = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return cars.filter((car) => (filter === 'All' || car.type === filter) && (!normalized || `${car.name} ${car.type}`.toLowerCase().includes(normalized)));
  }, [filter, query]);
  const detailCar = cars.find((car) => car.id === detailCarId) ?? null;

  function signIn(event: FormEvent<HTMLFormElement>) { event.preventDefault(); localStorage.setItem('carshare-dev-session', 'active'); setSignedIn(true); }
  function signOut() { localStorage.removeItem('carshare-dev-session'); setSignedIn(false); }
  function switchTab(next: TabId) {
    setTabDirection(tabs.findIndex((tab) => tab.id === next) - tabs.findIndex((tab) => tab.id === activeTab));
    setDetailCarId(null); setActiveTab(next);
  }
  function openSavedCar(id: number) { setActiveTab('explore'); setDetailCarId(id); }
  function toggleSaved(id: number) { setSavedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); }
  function changeFilter(next: string) { if (next !== filter) setFilter(next); }

  if (!signedIn) return (
    <main className="apple-login">
      <motion.section className="apple-login-card" initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={spring} aria-labelledby="login-title">
        <div className="login-symbol"><img src="/valoar-logo.svg" alt="" /></div>
        <div className="login-copy"><h1 id="login-title">Welcome to CarShare</h1><p>Find and reserve a nearby car in Grozny. Your access stays on this device.</p></div>
        <form onSubmit={signIn}>
          <label htmlFor="dev-email">Email</label><input id="dev-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
          <label htmlFor="dev-password">Password</label><input id="dev-password" type="password" defaultValue="carshare" required autoComplete="current-password" />
          <motion.button type="submit" whileTap={{ scale: .98 }} transition={spring}>Continue <IconChevronRight size={20} /></motion.button>
        </form>
        <p className="privacy-note"><IconShieldCheck size={16} /> No account is created and no credentials leave this device.</p>
      </motion.section>
    </main>
  );

  return (
    <main className="app-shell apple-app">
      <AnimatePresence mode="popLayout" initial={false} custom={tabDirection}>
        <motion.div className="tab-stage" key={activeTab} custom={tabDirection}
          initial={reduceMotion ? { opacity: 0 } : { x: tabDirection > 0 ? 22 : -22, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { x: tabDirection > 0 ? -22 : 22, opacity: 0 }} transition={spring}>
          {activeTab === 'explore' ? (
            <section className="explore-page" aria-labelledby="fleet-title">
              <header className="apple-header"><div className="apple-brand"><span><img src="/valoar-logo.svg" alt="" /></span>CarShare</div><button className="avatar-button" onClick={() => switchTab('account')} aria-label="Open account">N</button></header>
              <div className="title-block"><button className="location-label"><IconNavigation size={13} fill="currentColor" /> Grozny <IconChevronRight size={14} /></button><h1 id="fleet-title">Available nearby</h1><p>{visibleCars.length} cars ready to drive</p></div>
              <div className="search-row"><label className="apple-search"><IconSearch size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search available cars" placeholder="Search cars" /></label><button className="filter-button" aria-label="Adjust search filters"><IconAdjustmentsHorizontal size={21} /></button></div>
              <div className="apple-filters" aria-label="Taxi class filters">{filters.map((item) => <motion.button key={item} onClick={() => changeFilter(item)} className={filter === item ? 'active' : ''} whileTap={{ scale: .96 }} transition={spring}>{item === 'All' ? 'All cars' : item}</motion.button>)}</div>
              <div className="section-heading"><h2>Closest cars</h2></div>
              <div className="vehicle-list">
                <AnimatePresence initial={false} mode="wait">
                  <motion.div className="vehicle-set" key={`${filter}:${query.trim().toLowerCase()}`}
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }} transition={{ duration: reduceMotion ? .01 : .18, ease: 'easeOut' }}>
                    {visibleCars.map((car, index) => <motion.article className="vehicle-card" key={car.id} role="button" tabIndex={0} onClick={() => setDetailCarId(car.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setDetailCarId(car.id); }} aria-label={`Open details for ${car.name}`} initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ ...spring, delay: reduceMotion ? 0 : index * .045 }} whileTap={{ scale: .985 }}>
                      <div className="vehicle-photo"><img src={car.image} alt={car.name} /><span className="walk-badge"><IconMapPin size={12} /> {car.walk} min</span></div>
                      <div className="vehicle-copy"><div className="vehicle-topline"><span>{car.electric && <IconBolt size={12} fill="currentColor" />}{car.type}</span><button className={savedIds.includes(car.id) ? 'saved' : ''} onClick={(event) => { event.stopPropagation(); toggleSaved(car.id); }} aria-label={`${savedIds.includes(car.id) ? 'Remove' : 'Save'} ${car.name}`}><IconHeart size={19} fill={savedIds.includes(car.id) ? 'currentColor' : 'none'} /></button></div><h3>{car.name}</h3><p>{car.plate} · {car.range} km range</p><div className="vehicle-footer"><strong>₽{car.price.toLocaleString('ru-RU')}<small>/day</small></strong></div></div>
                    </motion.article>)}
                    {!visibleCars.length && <div className="empty-state"><IconSearch size={28} /><h3>No cars found</h3><p>Try another search or filter.</p></div>}
                  </motion.div>
                </AnimatePresence>
              </div>
              <AnimatePresence>{detailCar && <motion.section className="car-detail apple-detail" aria-labelledby="car-detail-title" initial={reduceMotion ? { opacity: 0 } : { x: '100%' }} animate={{ x: 0, opacity: 1 }} exit={reduceMotion ? { opacity: 0 } : { x: '100%' }} transition={spring}>
                <div className="detail-hero"><img src={detailCar.image} alt={detailCar.name} /><div className="detail-scrim" /><motion.button className="detail-glass-button detail-back" whileTap={{ scale: .9 }} onClick={() => setDetailCarId(null)} aria-label="Back to available cars"><IconArrowLeft size={23} /></motion.button><motion.button className={`detail-glass-button detail-save ${savedIds.includes(detailCar.id) ? 'saved' : ''}`} whileTap={{ scale: .9 }} onClick={() => toggleSaved(detailCar.id)} aria-label={`Save ${detailCar.name}`}><IconHeart size={21} fill={savedIds.includes(detailCar.id) ? 'currentColor' : 'none'} /></motion.button><div className="detail-hero-copy"><span>{detailCar.electric && <IconBolt size={12} fill="currentColor" />}{detailCar.type}</span><h1 id="car-detail-title">{detailCar.name}</h1><p><IconMapPin size={14} /> {detailCar.walk} min walk · Central Grozny</p></div></div>
                <div className="detail-content"><div className="detail-price"><div><span>Daily rental</span><strong>₽{detailCar.price.toLocaleString('ru-RU')}<small>/day</small></strong></div><span className="detail-available"><i />Available now</span></div><div className="detail-metrics"><div><IconGauge size={21} /><span>Range<strong>{detailCar.range} km</strong></span></div><div><IconBattery size={21} /><span>{detailCar.electric ? 'Charge' : 'Fuel'}<strong>{detailCar.electric ? '82%' : '74%'}</strong></span></div><div><IconUsers size={21} /><span>Seats<strong>5 people</strong></span></div></div><section className="detail-section"><h2>Ready for the city</h2><p>Automatic transmission, climate control, phone connectivity, and everything you need for a comfortable drive around Grozny.</p></section><section className="detail-section"><h2>Included</h2><div className="feature-list"><span><IconShieldCheck size={19} />Comprehensive insurance</span><span><IconCar size={19} />Fuel and city parking</span><span><IconRoute size={19} />24/7 roadside support</span></div></section><section className="detail-section detail-location"><h2>Pickup</h2><div><IconMapPin size={20} /><span><strong>Central Grozny</strong><small>{detailCar.walk} minute walk · exact location after reservation</small></span></div></section></div>
                <div className="detail-action"><motion.button className={`detail-reserve ${reservedId === detailCar.id ? 'reserved' : ''}`} whileTap={{ scale: .98 }} transition={spring} onClick={() => setReservedId(reservedId === detailCar.id ? null : detailCar.id)}><span>{reservedId === detailCar.id ? 'Reserved for today' : 'Reserve this car'}</span><b>{reservedId === detailCar.id ? <><IconCheck size={17} /> Reserved</> : `₽${detailCar.price.toLocaleString('ru-RU')}/day`}</b></motion.button></div>
              </motion.section>}</AnimatePresence>
            </section>
          ) : <SecondaryPage activeTab={activeTab} savedIds={savedIds} signOut={signOut} switchTab={switchTab} openSavedCar={openSavedCar} toggleSaved={toggleSaved} />}
        </motion.div>
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {!detailCar && <motion.nav className="apple-tabbar" aria-label="Main navigation" initial={reduceMotion ? { opacity: 0 } : { opacity: 0, filter: 'blur(7px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, filter: 'blur(7px)' }} transition={{ duration: reduceMotion ? .01 : .28, ease: 'easeOut' }}>{tabs.map((tab) => { const Icon = tab.icon; const isActive = activeTab === tab.id; return <motion.button key={tab.id} onClick={() => switchTab(tab.id)} className={isActive ? 'active' : ''} aria-current={isActive ? 'page' : undefined} whileTap={{ scale: .92 }} transition={spring}>{isActive && <motion.span className="tab-selection" layoutId="tab-selection" transition={spring} />}<span className="tab-icon"><Icon size={22} stroke={isActive ? 2 : 1.7} fill={isActive && tab.id === 'saved' ? 'currentColor' : 'none'} /></span><small>{tab.label}</small></motion.button>; })}</motion.nav>}
      </AnimatePresence>
    </main>
  );
}

function SecondaryPage({ activeTab, savedIds, signOut, switchTab, openSavedCar, toggleSaved }: { activeTab: Exclude<TabId, 'explore'>; savedIds: number[]; signOut: () => void; switchTab: (tab: TabId) => void; openSavedCar: (id: number) => void; toggleSaved: (id: number) => void }) {
  const reduceMotion = useReducedMotion();
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showFinances, setShowFinances] = useState(false);
  const totalSpend = trips.reduce((sum, trip) => sum + trip.price, 0);
  const totalMinutes = trips.reduce((sum, trip) => sum + trip.duration, 0);
  const totalDistance = trips.reduce((sum, trip) => sum + trip.distance, 0);

  return <section className="secondary-page" aria-labelledby={`${activeTab}-title`}>
    <header className="secondary-header"><div><span>CarShare</span><h1 id={`${activeTab}-title`}>{activeTab === 'trips' ? 'Trips' : activeTab === 'saved' ? 'Saved' : 'Account'}</h1></div><button className="avatar-button" onClick={() => switchTab('account')} aria-label="Open account">N</button></header>
    {activeTab === 'trips' && <div className="secondary-content">
      <motion.button className="activity-card activity-card-button" onClick={() => setShowFinances(true)} whileTap={{ scale: .985 }} transition={spring} aria-label="Open trip activity and spending">
        <div><span>August activity</span><strong>{totalMinutes} min</strong><p>Across {trips.length} trips</p><small>View spending insights <IconChevronRight size={14} /></small></div>
        <div className="activity-ring"><span>₽{totalSpend}</span><small>total</small></div>
      </motion.button>
      <div className="section-heading"><h2>Recent trips</h2><button onClick={() => setShowFinances(true)}>See all <IconChevronRight size={15} /></button></div>
      <div className="grouped-list">{trips.slice(0, 2).map((trip) => <motion.button className="trip-row" key={trip.id} onClick={() => setSelectedTrip(trip)} whileTap={{ backgroundColor: 'rgba(255,255,255,.07)' }} transition={spring} aria-label={`Open trip with ${trip.car}`}><span className="row-icon green"><IconCheck size={18} /></span><div><strong>{trip.car}</strong><p>{trip.date}, {trip.time} · {trip.duration} min</p><small>{trip.from} → {trip.to}</small></div><span className="trip-price">₽{trip.price}<IconChevronRight size={16} /></span></motion.button>)}</div>
    </div>}
    {activeTab === 'saved' && <div className="secondary-content"><p className="page-intro">Cars you want to find quickly, kept in one place.</p><div className="vehicle-list"><motion.div className="vehicle-set saved-vehicle-set" layout transition={spring}><AnimatePresence initial={false} mode="popLayout">{cars.filter((car) => savedIds.includes(car.id)).map((car, index) => <motion.article layout className="vehicle-card" key={car.id} role="button" tabIndex={0} onClick={() => openSavedCar(car.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') openSavedCar(car.id); }} aria-label={`Open details for ${car.name}`} initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: .96 }} transition={{ ...spring, delay: reduceMotion ? 0 : index * .045 }} whileTap={{ scale: .985 }}><div className="vehicle-photo"><img src={car.image} alt={car.name} /><span className="walk-badge"><IconMapPin size={12} /> {car.walk} min</span></div><div className="vehicle-copy"><div className="vehicle-topline"><span>{car.electric && <IconBolt size={12} fill="currentColor" />}{car.type}</span><button className="saved" onClick={(event) => { event.stopPropagation(); toggleSaved(car.id); }} aria-label={`Remove ${car.name}`}><IconHeart size={19} fill="currentColor" /></button></div><h3>{car.name}</h3><p>{car.plate} · {car.range} km range</p><div className="vehicle-footer"><strong>₽{car.price.toLocaleString('ru-RU')}<small>/day</small></strong></div></div></motion.article>)}</AnimatePresence></motion.div></div></div>}
    {activeTab === 'account' && <div className="secondary-content"><section className="profile-card"><div className="large-avatar">N</div><div><strong>NVR</strong><span>developer@carshare.local</span></div></section><div className="section-heading"><h2>Preferences</h2></div><div className="grouped-list settings-list"><button><span className="row-icon blue"><IconCreditCard size={18} /></span><div><strong>Payment method</strong><small>Mock card ·· 4242</small></div><IconChevronRight size={18} /></button><button><span className="row-icon purple"><IconId size={18} /></span><div><strong>Driving documents</strong><small>Verified</small></div><IconChevronRight size={18} /></button><button><span className="row-icon indigo"><IconMoon size={18} /></span><div><strong>Appearance</strong><small>Dark</small></div><IconChevronRight size={18} /></button></div><button className="apple-signout" onClick={signOut}><IconLogout size={18} /> Sign out</button></div>}

    <AnimatePresence>
      {selectedTrip && <TripDetail trip={selectedTrip} reduceMotion={!!reduceMotion} onClose={() => setSelectedTrip(null)} />}
      {showFinances && <FinanceDetail totalSpend={totalSpend} totalMinutes={totalMinutes} totalDistance={totalDistance} reduceMotion={!!reduceMotion} onClose={() => setShowFinances(false)} onSelectTrip={(trip) => { setShowFinances(false); setSelectedTrip(trip); }} />}
    </AnimatePresence>
  </section>;
}

function DetailHeader({ title, subtitle, onClose }: { title: string; subtitle: string; onClose: () => void }) {
  return <header className="trip-detail-header"><motion.button whileTap={{ scale: .9 }} onClick={onClose} aria-label="Back to trips"><IconArrowLeft size={22} /></motion.button><div><span>{subtitle}</span><h2>{title}</h2></div><span className="header-spacer" /></header>;
}

function TripDetail({ trip, reduceMotion, onClose }: { trip: Trip; reduceMotion: boolean; onClose: () => void }) {
  return <motion.section className="trip-overlay" initial={reduceMotion ? { opacity: 0 } : { x: '100%' }} animate={{ x: 0, opacity: 1 }} exit={reduceMotion ? { opacity: 0 } : { x: '100%' }} transition={spring} aria-labelledby="trip-detail-title">
    <DetailHeader title="Trip receipt" subtitle={`${trip.date} · ${trip.time}`} onClose={onClose} />
    <div className="trip-overlay-content">
      <section className="trip-total"><span className="completion-mark"><IconCheck size={22} /></span><p>Completed</p><strong>₽{trip.price}</strong><small>{trip.car} · {trip.duration} minutes</small></section>
      <div className="trip-metrics"><div><IconClock size={20} /><span>Duration<strong>{trip.duration} min</strong></span></div><div><IconRoute size={20} /><span>Distance<strong>{trip.distance} km</strong></span></div></div>
      <section className="detail-block"><h3>Route</h3><div className="route-timeline"><div><i /><span><small>Start</small><strong>{trip.from}</strong><p>{trip.time}</p></span></div><div><i /><span><small>Finish</small><strong>{trip.to}</strong><p>{addMinutes(trip.time, trip.duration)}</p></span></div></div></section>
      <section className="detail-block"><h3>Payment details</h3><div className="receipt-list"><div><span>Driving time</span><b>₽{trip.rate}</b></div><div><span>Parking</span><b>{trip.parking ? `₽${trip.parking}` : 'Included'}</b></div><div><span>Total</span><b>₽{trip.price}</b></div></div></section>
      <p className="trip-support"><IconShieldCheck size={17} /> Insurance and roadside support were included.</p>
    </div>
  </motion.section>;
}

function FinanceDetail({ totalSpend, totalMinutes, totalDistance, reduceMotion, onClose, onSelectTrip }: { totalSpend: number; totalMinutes: number; totalDistance: number; reduceMotion: boolean; onClose: () => void; onSelectTrip: (trip: Trip) => void }) {
  const budget = 1200;
  return <motion.section className="trip-overlay" initial={reduceMotion ? { opacity: 0 } : { x: '100%' }} animate={{ x: 0, opacity: 1 }} exit={reduceMotion ? { opacity: 0 } : { x: '100%' }} transition={spring} aria-labelledby="finance-title">
    <DetailHeader title="Trip activity" subtitle="August overview" onClose={onClose} />
    <div className="trip-overlay-content finance-content">
      <section className="finance-hero"><span>Spent this month</span><strong>₽{totalSpend}</strong><p>₽{Math.round(totalSpend / trips.length)} average per trip</p><div className="budget-label"><span>Monthly budget</span><b>₽{totalSpend} of ₽{budget}</b></div><div className="budget-track"><motion.i initial={{ width: 0 }} animate={{ width: `${totalSpend / budget * 100}%` }} transition={spring} /></div><small>₽{budget - totalSpend} remaining</small></section>
      <div className="finance-metrics"><div><IconRoute size={20} /><strong>{totalDistance.toFixed(1)} km</strong><span>Total distance</span></div><div><IconClock size={20} /><strong>{totalMinutes} min</strong><span>Drive time</span></div><div><IconCreditCard size={20} /><strong>{trips.length}</strong><span>Trips</span></div></div>
      <section className="detail-block"><h3>Spending breakdown</h3><div className="spend-breakdown"><div><span><i className="blue-dot" />Driving</span><b>₽368 <small>95%</small></b></div><div><span><i className="purple-dot" />Parking</span><b>₽18 <small>5%</small></b></div></div></section>
      <section className="detail-block"><h3>All trips</h3><div className="finance-trip-list">{trips.map((trip) => <button key={trip.id} onClick={() => onSelectTrip(trip)}><span><strong>{trip.car}</strong><small>{trip.date} · {trip.duration} min</small></span><b>₽{trip.price}<IconChevronRight size={16} /></b></button>)}</div></section>
    </div>
  </motion.section>;
}

function addMinutes(time: string, minutes: number) {
  const [hours, currentMinutes] = time.split(':').map(Number);
  const total = hours * 60 + currentMinutes + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}
