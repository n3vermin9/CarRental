import { getCopy, type Locale } from './i18n.ts';

export type TabId = 'explore' | 'trips' | 'saved' | 'account';
export type Theme = 'dark' | 'light';
export type BookingStatus = 'confirmed' | 'ready' | 'active' | 'completed';
export type Car = { id: number; name: string; type: string; electric: boolean; plate: string; range: number; price: number; walk: number; image: string };
export type Trip = { id: number; car: string; date: string; time: string; endDate: string; endTime: string; days: number; distance: number; from: string; to: string; price: number; rentalFee: number; extras: number };
export type Reservation = { carId: number; startDate: string; pickupTime: string; days: number; total: number; bookedOn: string; confirmation: string; status: BookingStatus; promoCode?: string; discount?: number };
export type FleetFilters = { maxPrice: number | null; brand: string; carClass: string };
export type NoticeKind = 'pickup' | 'return' | 'extension';
export type AppNotice = { id: string; kind: NoticeKind; createdAt: string; read: boolean };
export type ProfileData = { name: string; email: string; phone: string };
export type PaymentData = { label: string; last4: string };
export type LicenceData = { number: string; expiry: string; verified: boolean };
export type AccountSheetKind = 'profile' | 'payment' | 'licence' | 'notifications';

export const cars: Car[] = [
  { id: 1, name: 'Toyota Camry', type: 'Comfort', electric: false, plate: 'T704AM', range: 610, price: 4900, walk: 2, image: '/cars/01-toyota-camry.webp' },
  { id: 2, name: 'Mercedes-Benz G-Class', type: 'Business', electric: false, plate: 'M777MM', range: 620, price: 18900, walk: 4, image: '/cars/02-mercedes-benz-g-class.webp' },
  { id: 3, name: 'BMW 5 Series', type: 'Business', electric: false, plate: 'B505MP', range: 680, price: 8900, walk: 5, image: '/cars/03-bmw-5-series.webp' },
  { id: 4, name: 'Haval Jolion', type: 'Comfort', electric: false, plate: 'P605YT', range: 530, price: 4600, walk: 6, image: '/cars/04-haval-jolion.webp' },
  { id: 5, name: 'Toyota RAV4', type: 'Comfort', electric: false, plate: 'K404AE', range: 590, price: 5900, walk: 7, image: '/cars/05-toyota-rav4.webp' },
  { id: 6, name: 'Kia Sportage', type: 'Comfort', electric: false, plate: 'E318XA', range: 570, price: 5200, walk: 8, image: '/cars/06-kia-sportage.webp' },
  { id: 7, name: 'Hyundai Solaris', type: 'Economy', electric: false, plate: 'A227KC', range: 540, price: 3100, walk: 3, image: '/cars/07-hyundai-solaris.webp' },
  { id: 8, name: 'Audi Q5', type: 'Business', electric: false, plate: 'O505OO', range: 650, price: 9400, walk: 9, image: '/cars/08-audi-q5.webp' },
  { id: 9, name: 'Chery Arrizo 8', type: 'Comfort', electric: false, plate: 'A808CA', range: 560, price: 5100, walk: 10, image: '/cars/09-chery-arrizo-8.webp' },
  { id: 10, name: 'Changan X5 Plus', type: 'Comfort', electric: false, plate: 'X505BA', range: 520, price: 4700, walk: 11, image: '/cars/10-changan-x5-plus.webp' },
  { id: 11, name: 'Toyota Land Cruiser', type: 'Business', electric: false, plate: 'T200LC', range: 760, price: 13900, walk: 12, image: '/cars/11-toyota-land-cruiser.webp' },
  { id: 12, name: 'Mercedes-Benz E-Class', type: 'Business', electric: false, plate: 'E220MB', range: 690, price: 9900, walk: 13, image: '/cars/12-mercedes-benz-e-class.webp' },
  { id: 13, name: 'BMW X5', type: 'Business', electric: false, plate: 'X505BM', range: 710, price: 11900, walk: 14, image: '/cars/13-bmw-x5.webp' },
  { id: 14, name: 'Volkswagen Tiguan', type: 'Comfort', electric: false, plate: 'T614BA', range: 630, price: 5600, walk: 5, image: '/cars/14-volkswagen-tiguan.webp' },
  { id: 15, name: 'Haval M6', type: 'Economy', electric: false, plate: 'M606XA', range: 580, price: 3900, walk: 6, image: '/cars/15-haval-m6.webp' },
  { id: 16, name: 'Geely Monjaro', type: 'Business', electric: false, plate: 'M010GE', range: 640, price: 7200, walk: 8, image: '/cars/16-geely-monjaro.webp' },
  { id: 17, name: 'Porsche Cayenne', type: 'Business', electric: false, plate: 'P911CA', range: 700, price: 16900, walk: 15, image: '/cars/17-porsche-cayenne.webp' },
  { id: 18, name: 'Geely Coolray', type: 'Economy', electric: false, plate: 'C018GE', range: 510, price: 4200, walk: 7, image: '/cars/18-geely-coolray.webp' },
  { id: 19, name: 'Omoda C5', type: 'Comfort', electric: false, plate: 'C505OM', range: 550, price: 4800, walk: 9, image: '/cars/19-omoda-c5.webp' },
  { id: 20, name: 'Jetour Dashing', type: 'Comfort', electric: false, plate: 'D020JE', range: 570, price: 5000, walk: 10, image: '/cars/20-jetour-dashing.webp' },
];

export const carSearchAliases: Record<number, string> = {
  1: 'toyota camry тойота камри', 2: 'mercedes benz g class мерседес бенц джи класс гелендваген', 3: 'bmw 5 series бмв 5 серия пятерка',
  4: 'haval jolion хавал джолион', 5: 'toyota rav4 rav 4 тойота рав4 рав 4', 6: 'kia sportage киа спортейдж',
  7: 'hyundai solaris хендай хюндай хундай солярис', 8: 'audi q5 ауди ку5 ку 5', 9: 'chery arrizo 8 чери арризо 8',
  10: 'changan x5 plus чанган икс5 плюс', 11: 'toyota land cruiser тойота ленд крузер ланд крузер',
  12: 'mercedes benz e class мерседес бенц е класс', 13: 'bmw x5 бмв икс5 икс 5',
  14: 'volkswagen tiguan фольксваген фольцваген тигуан', 15: 'haval m6 хавал м6 эм6',
  16: 'geely monjaro джили монджаро', 17: 'porsche cayenne порше кайен', 18: 'geely coolray джили кулрей',
  19: 'omoda c5 омода с5 си5', 20: 'jetour dashing джетур дашинг',
};

export const carBrandLogos = [
  ['Mercedes-Benz', 'https://api.iconify.design/tabler/brand-mercedes.svg?color=%231c1c1e&height=64'],
  ['Volkswagen', 'https://api.iconify.design/simple-icons/volkswagen.svg?color=%231c1c1e&height=64'],
  ['Hyundai', 'https://api.iconify.design/simple-icons/hyundai.svg?color=%231c1c1e&height=64'],
  ['Toyota', 'https://api.iconify.design/simple-icons/toyota.svg?color=%231c1c1e&height=64'],
  ['Porsche', 'https://api.iconify.design/simple-icons/porsche.svg?color=%231c1c1e&height=64'],
  ['Changan', 'https://upload.wikimedia.org/wikipedia/commons/0/00/Changan_icon.svg'],
  ['Jetour', 'https://upload.wikimedia.org/wikipedia/commons/4/42/Jetour_logomark.svg'],
  ['Omoda', 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Omoda_wordmark.svg'],
  ['Chery', 'https://upload.wikimedia.org/wikipedia/commons/5/51/Chery_symbol.svg'],
  ['Geely', 'https://api.iconify.design/cbi/geely.svg?color=%231c1c1e&height=64'],
  ['Haval', 'https://upload.wikimedia.org/wikipedia/commons/d/da/Haval_2023_logo.svg'],
  ['BMW', 'https://api.iconify.design/simple-icons/bmw.svg?color=%231c1c1e&height=64'],
  ['Audi', 'https://api.iconify.design/simple-icons/audi.svg?color=%231c1c1e&height=64'],
  ['Kia', 'https://api.iconify.design/simple-icons/kia.svg?color=%231c1c1e&height=64'],
] as const;

export const filters = ['All', 'Economy', 'Comfort', 'Business'];
export const emptyFleetFilters: FleetFilters = { maxPrice: null, brand: 'All', carClass: 'All' };
export const defaultProfile: ProfileData = { name: 'NVR', email: 'developer@carshare.local', phone: '+7 928 000-00-00' };
export const defaultPayment: PaymentData = { label: 'Mock Visa', last4: '4242' };
export const defaultLicence: LicenceData = { number: 'TEST-20-26', expiry: '08/2030', verified: true };
export const pickupWaitDailyFee = 500;
export const reservationStorageVersion = 'clean-start-v1';

export const trips: Trip[] = [
  { id: 1, car: 'Toyota Camry', date: '24 Aug', time: '10:00', endDate: '26 Aug', endTime: '10:00', days: 2, distance: 124, from: 'Grozny Mall', to: 'Minutka Square', price: 10400, rentalFee: 9800, extras: 600 },
  { id: 2, car: 'Haval Jolion', date: '20 Aug', time: '12:00', endDate: '23 Aug', endTime: '12:00', days: 3, distance: 196, from: 'Putin Avenue', to: 'Flower Park', price: 13800, rentalFee: 13800, extras: 0 },
  { id: 3, car: 'Hyundai Solaris', date: '18 Aug', time: '09:30', endDate: '19 Aug', endTime: '09:30', days: 1, distance: 72, from: 'Grozny City', to: 'Airport District', price: 3400, rentalFee: 3100, extras: 300 },
];

export function normalizeSearch(value: string) {
  return value.trim().toLocaleLowerCase().replaceAll('ё', 'е');
}

export function carBrandLogo(name: string) {
  return carBrandLogos.find(([brand]) => name.startsWith(brand))?.[1] ?? '';
}

export function carBrandName(name: string) {
  return carBrandLogos.find(([brand]) => name.startsWith(brand))?.[0] ?? name.split(' ')[0];
}

export function carSeats(name: string) {
  return ['Mercedes-Benz G-Class', 'Toyota Land Cruiser', 'Haval M6'].includes(name) ? 7 : 5;
}

export function isBookingStatus(value: unknown): value is BookingStatus {
  return value === 'confirmed' || value === 'ready' || value === 'active' || value === 'completed';
}

export function sanitizeProfile(value: Partial<ProfileData>): ProfileData {
  const name = String(value.name ?? '').trim().replace(/\s+/g, ' ').slice(0, 40);
  const email = String(value.email ?? '').trim().slice(0, 80);
  const phone = String(value.phone ?? '').trim().replace(/[^\d+()\-\s]/g, '').slice(0, 22);
  const digits = phone.replace(/\D/g, '');
  return {
    name: /^[\p{L}][\p{L}\s'’-]{1,39}$/u.test(name) ? name : defaultProfile.name,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : defaultProfile.email,
    phone: digits.length >= 10 && digits.length <= 15 ? phone : defaultProfile.phone,
  };
}

export function todayISO() {
  const value = new Date();
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}

export function parseISODate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const value = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(value.getTime())) return null;
  return value.toISOString().slice(0, 10) === date ? value : null;
}

export function isValidISODate(date: unknown): date is string {
  return typeof date === 'string' && parseISODate(date) !== null;
}

export function isValidRentalDays(days: unknown): days is number {
  return typeof days === 'number' && Number.isInteger(days) && days >= 1 && days <= 30;
}

export function isValidPickupTime(time: unknown): time is string {
  return typeof time === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time);
}

export function addDaysISO(date: string, days: number) {
  const value = parseISODate(date);
  if (!value || !Number.isInteger(days) || days < 0 || days > 30) return '';
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function daysBetweenISO(start: string, end: string) {
  const from = parseISODate(start);
  const to = parseISODate(end);
  if (!from || !to) return 0;
  return Math.ceil((to.getTime() - from.getTime()) / 86400000);
}

export function formatRentalDate(date: string, locale: Locale) {
  const value = parseISODate(date);
  if (!value) return getCopy(locale).chooseDate;
  return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(value);
}

export function formatPickupDate(date: string, locale: Locale) {
  const value = parseISODate(date);
  if (!value) return getCopy(locale).chooseDate;
  return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(value);
}

export function formatPickupTime(time: string, locale: Locale) {
  if (!isValidPickupTime(time)) return '10:00';
  return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' }).format(new Date(`2000-01-01T${time}:00Z`));
}

export function promoDiscount(code: string, subtotal: number) {
  const normalized = code.trim().toUpperCase();
  if (normalized === 'GROZNY10') return Math.min(2500, Math.round(subtotal * .1));
  if (normalized === 'WELCOME500') return Math.min(500, subtotal);
  return 0;
}

export function reservationPriceBreakdown(car: Car, startDate: string, days: number, bookedOn = todayISO(), promoCode = '') {
  const waitDays = Math.max(0, daysBetweenISO(bookedOn, startDate));
  const rentalFee = car.price * days;
  const pickupWaitFee = waitDays * pickupWaitDailyFee;
  const subtotal = rentalFee + pickupWaitFee;
  const discount = promoDiscount(promoCode, subtotal);
  return { waitDays, rentalFee, pickupWaitFee, subtotal, discount, total: Math.max(0, subtotal - discount) };
}

export function createReservation(car: Car, startDate: string, pickupTime: string, days: number, confirmation = `CR-${String(Date.now()).slice(-6)}`, bookedOn = todayISO(), promoCode = ''): Reservation {
  const pricing = reservationPriceBreakdown(car, startDate, days, bookedOn, promoCode);
  return { carId: car.id, startDate, pickupTime, days, total: pricing.total, bookedOn, confirmation, status: 'confirmed', promoCode: promoCode || undefined, discount: pricing.discount || undefined };
}

export function tabPath(tab: TabId) {
  return tab === 'explore' ? '/explore' : `/${tab}`;
}

export function parseAppPath(pathname: string): { tab: TabId; carId: number | null; reservation: boolean } {
  const carMatch = pathname.match(/^\/cars\/(\d+)\/?$/);
  if (carMatch) {
    const carId = Number(carMatch[1]);
    return { tab: 'explore', carId: cars.some((car) => car.id === carId) ? carId : null, reservation: false };
  }
  if (/^\/reservation\/?$/.test(pathname)) return { tab: 'trips', carId: null, reservation: true };
  const tab = pathname.replace(/^\/+|\/+$/g, '') as TabId;
  return { tab: ['explore', 'trips', 'saved', 'account'].includes(tab) ? tab : 'explore', carId: null, reservation: false };
}
