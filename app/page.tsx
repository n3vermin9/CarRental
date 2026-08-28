'use client';

import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  IconAdjustmentsHorizontal, IconArrowLeft, IconBattery, IconBell, IconBolt, IconCar,
  IconCheck, IconChevronDown, IconChevronRight, IconClock, IconCreditCard, IconGauge, IconHeart, IconId,
  IconHome, IconLanguage, IconLogout, IconMapPin, IconMoon, IconNavigation, IconPlus, IconRoute, IconSearch, IconSun,
  IconShieldCheck, IconUser, IconUsers, IconX,
} from '@tabler/icons-react';
import { carTypeLabel, dayCount, getCopy, Locale, minuteCount, tripCount, tripDate, tripPlace } from './i18n';

type TabId = 'explore' | 'trips' | 'saved' | 'account';
type Theme = 'dark' | 'light';
type BookingStatus = 'confirmed' | 'ready' | 'active' | 'completed';
type Car = { id: number; name: string; type: string; electric: boolean; plate: string; range: number; price: number; walk: number; image: string };
type Trip = { id: number; car: string; date: string; time: string; endDate: string; endTime: string; days: number; distance: number; from: string; to: string; price: number; rentalFee: number; extras: number };
type Reservation = { carId: number; startDate: string; days: number; total: number; confirmation: string; status: BookingStatus };
type FleetFilters = { maxPrice: number | null; brand: string; carClass: string };
type NoticeKind = 'pickup' | 'return' | 'extension';
type AppNotice = { id: string; kind: NoticeKind; createdAt: string; read: boolean };
type ProfileData = { name: string; email: string; phone: string };
type PaymentData = { label: string; last4: string };
type LicenceData = { number: string; expiry: string; verified: boolean };
type AccountSheetKind = 'profile' | 'payment' | 'licence' | 'notifications';

const cars: Car[] = [
  { id: 1, name: 'Toyota Camry', type: 'Comfort', electric: false, plate: 'T704AM', range: 610, price: 4900, walk: 2, image: 'https://cdn.rotorint.com/Camry/2025_11_Nov/e/hero/png/lo/2704x1520/CAM_SPN_010040FA202V03600B0_compcrop_004.png' },
  { id: 2, name: 'Mercedes-Benz G-Class', type: 'Business', electric: false, plate: 'M777MM', range: 620, price: 18900, walk: 4, image: 'https://cdn.apiweb.rolf.ru/storage/uploads/models/120-mercedes-benz/6859-g-klass-amg/0797aee700c6185496c0f534d8b7e388.png' },
  { id: 3, name: 'BMW 5 Series', type: 'Business', electric: false, plate: 'B505MP', range: 680, price: 8900, walk: 5, image: 'https://thacoautotphcm.vn/storage/bmw/hinh-dai-dien/bmw-5-series.webp' },
  { id: 4, name: 'Haval Jolion', type: 'Comfort', electric: false, plate: 'P605YT', range: 530, price: 4600, walk: 6, image: 'https://ac-garantauto.ru/storage/car/haval/jolion/colors/GAH1khoY9018H9IdzaJRUYUhf5Gzzphw.png' },
  { id: 5, name: 'Toyota RAV4', type: 'Comfort', electric: false, plate: 'K404AE', range: 590, price: 5900, walk: 7, image: 'https://pluspng.com/img-png/toyota-rav4-png-search-new-toyota-rav-4-inventory-1280.png' },
  { id: 6, name: 'Kia Sportage', type: 'Comfort', electric: false, plate: 'E318XA', range: 570, price: 5200, walk: 8, image: 'https://e7.pngegg.com/pngimages/926/1023/png-clipart-kia-motors-kia-sportage-car-kia-picanto-kia-compact-car-driving.png' },
  { id: 7, name: 'Hyundai Solaris', type: 'Economy', electric: false, plate: 'A227KC', range: 540, price: 3100, walk: 3, image: 'https://png.klev.club/uploads/posts/2024-05/thumbs/png-klev-club-ef01-p-solyaris-png-6.png' },
  { id: 8, name: 'Audi Q5', type: 'Business', electric: false, plate: 'O505OO', range: 650, price: 9400, walk: 9, image: 'https://wallpapers.com/images/hd/white-audi-s-u-v-profile-view-ewx3f0qfxwkmh3x6.png' },
  { id: 9, name: 'Chery Arrizo 8', type: 'Comfort', electric: false, plate: 'A808CA', range: 560, price: 5100, walk: 10, image: 'https://www.uservice.ru/bitrix/components/allsites/v2.instock.cars/carpics/chery/arrizo8/White.png' },
  { id: 10, name: 'Changan X5 Plus', type: 'Comfort', electric: false, plate: 'X505BA', range: 520, price: 4700, walk: 11, image: 'https://avantaauto.ru/upload/resize_cache/iblock/aab/600_600_140cd750bba9870f18aada2478b24840a/70cca1qgjb5xf9j5ek2k5ohfysq6iavm.png' },
  { id: 11, name: 'Toyota Land Cruiser', type: 'Business', electric: false, plate: 'T200LC', range: 760, price: 13900, walk: 12, image: 'https://www.pngfind.com/pngs/m/428-4281099_2018-toyota-land-cruiser-2019-toyota-land-cruiser.png' },
  { id: 12, name: 'Mercedes-Benz E-Class', type: 'Business', electric: false, plate: 'E220MB', range: 690, price: 9900, walk: 13, image: 'https://img.mercedes-benz-kiev.com/data/purchase/e-class-limousine/0552620122/mercedes-benz-e-class-limousine-1.jpg' },
  { id: 13, name: 'BMW X5', type: 'Business', electric: false, plate: 'X505BM', range: 710, price: 11900, walk: 14, image: 'https://galleriabmw.com/wp-content/uploads/sites/85/2022/03/X5.png' },
  { id: 14, name: 'Volkswagen Tiguan', type: 'Comfort', electric: false, plate: 'T614BA', range: 630, price: 5600, walk: 5, image: 'https://cms-assets.autoscout24.com/uaddx06iwzdz/718bCkCDMUc9aVoJ5KzNzF/25fa7c3327f21fe2e48c8c8f763f09b6/seo-ca-research-Volkswagen-Tiguan-2024-1.png?w=1100' },
  { id: 15, name: 'Haval M6', type: 'Economy', electric: false, plate: 'M606XA', range: 580, price: 3900, walk: 6, image: 'https://ac-garantauto.ru/storage/car/haval/m6/colors/VFNY1Q58DksqVxGRCBVlcXTE1IwAglwI.png' },
  { id: 16, name: 'Geely Monjaro', type: 'Business', electric: false, plate: 'M010GE', range: 640, price: 7200, walk: 8, image: 'https://avtomir.ru/upload/uf/15e/g1nxeaxawrt99n489e31gket6h0kdpe1.png' },
  { id: 17, name: 'Porsche Cayenne', type: 'Business', electric: false, plate: 'P911CA', range: 700, price: 16900, walk: 15, image: 'https://optim.tildacdn.pro/tild3133-6463-4563-a661-303332313764/-/resize/778x/-/format/webp/Porsche-PNG-Image-Ba.png.webp' },
  { id: 18, name: 'Geely Coolray', type: 'Economy', electric: false, plate: 'C018GE', range: 510, price: 4200, walk: 7, image: 'https://www.sberleasing.ru/upload/dev2fun.imagecompress/webp/sbl.ilsa/d37/1t3v08jo363im5rjr03egt145nht8nn2/381f8a8accb2da9d73738e04270c828f.webp' },
  { id: 19, name: 'Omoda C5', type: 'Comfort', electric: false, plate: 'C505OM', range: 550, price: 4800, walk: 9, image: 'https://avtomir.ru/upload/uf/e52/0uhbz5hmusio0w9znqwin2nofpxw00yh.png' },
  { id: 20, name: 'Jetour Dashing', type: 'Comfort', electric: false, plate: 'D020JE', range: 570, price: 5000, walk: 10, image: 'https://www.major-auto.ru/images/models/jetour/dashing/30595/30595_medium.jpg' },
];
const carSearchAliases: Record<number, string> = {
  1: 'toyota camry тойота камри',
  2: 'mercedes benz g class мерседес бенц джи класс гелендваген',
  3: 'bmw 5 series бмв 5 серия пятерка',
  4: 'haval jolion хавал джолион',
  5: 'toyota rav4 rav 4 тойота рав4 рав 4',
  6: 'kia sportage киа спортейдж',
  7: 'hyundai solaris хендай хюндай хундай солярис',
  8: 'audi q5 ауди ку5 ку 5',
  9: 'chery arrizo 8 чери арризо 8',
  10: 'changan x5 plus чанган икс5 плюс',
  11: 'toyota land cruiser тойота ленд крузер ланд крузер',
  12: 'mercedes benz e class мерседес бенц е класс',
  13: 'bmw x5 бмв икс5 икс 5',
  14: 'volkswagen tiguan фольксваген фольцваген тигуан',
  15: 'haval m6 хавал м6 эм6',
  16: 'geely monjaro джили монджаро',
  17: 'porsche cayenne порше кайен',
  18: 'geely coolray джили кулрей',
  19: 'omoda c5 омода с5 си5',
  20: 'jetour dashing джетур дашинг',
};
const carBrandLogos = [
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
const filters = ['All', 'Economy', 'Comfort', 'Business'];
const emptyFleetFilters: FleetFilters = { maxPrice: null, brand: 'All', carClass: 'All' };
const defaultProfile: ProfileData = { name: 'NVR', email: 'developer@carshare.local', phone: '+7 928 000-00-00' };
const defaultPayment: PaymentData = { label: 'Mock Visa', last4: '4242' };
const defaultLicence: LicenceData = { number: 'TEST-20-26', expiry: '08/2030', verified: true };
const trips: Trip[] = [
  { id: 1, car: 'Toyota Camry', date: '24 Aug', time: '10:00', endDate: '26 Aug', endTime: '10:00', days: 2, distance: 124, from: 'Grozny Mall', to: 'Minutka Square', price: 10400, rentalFee: 9800, extras: 600 },
  { id: 2, car: 'Haval Jolion', date: '20 Aug', time: '12:00', endDate: '23 Aug', endTime: '12:00', days: 3, distance: 196, from: 'Putin Avenue', to: 'Flower Park', price: 13800, rentalFee: 13800, extras: 0 },
  { id: 3, car: 'Hyundai Solaris', date: '18 Aug', time: '09:30', endDate: '19 Aug', endTime: '09:30', days: 1, distance: 72, from: 'Grozny City', to: 'Airport District', price: 3400, rentalFee: 3100, extras: 300 },
];
const featureText = {
  en: {
    filters: 'Filters', reset: 'Reset', apply: 'Show cars', pickupDate: 'Pickup date', anyDate: 'Any date', maxDailyPrice: 'Maximum daily price', anyPrice: 'Any price', brand: 'Brand', anyBrand: 'Any brand', carClass: 'Car class', seats: 'Seats', anySeats: 'Any', filterResults: 'matching cars',
    ready: 'Ready for pickup', active: 'Active rental', completedRental: 'Rental completed', confirmedStatus: 'Confirmed', preparePickup: 'Mark ready for pickup', startRental: 'Start rental', completeRental: 'Complete rental', extendRental: 'Extend by one day', remaining: 'remaining', returnBy: 'Return by', pickupLocation: 'Pickup location', returnLocation: 'Return location', mockLifecycle: 'Development controls simulate the rental lifecycle.',
    notifications: 'Notifications', noNotifications: 'No notifications yet', pickupNotice: 'Pickup reminder', pickupNoticeBody: 'Your car is scheduled for pickup in Central Grozny.', returnNotice: 'Return reminder', returnNoticeBody: 'Your active rental is approaching its return date.', extensionNotice: 'Rental extended', extensionNoticeBody: 'One day was added and the mock total was updated.', markAllRead: 'Mark all read',
    editProfile: 'Edit profile', profileDetails: 'Profile details', fullName: 'Full name', phone: 'Phone', saveChanges: 'Save changes', nameRule: 'Use 2–40 letters.', emailRule: 'Enter a valid email address.', phoneRule: 'Enter 10–15 digits.', editPayment: 'Edit payment method', cardLabel: 'Card label', lastFour: 'Mock last four digits', mockOnly: 'Mock data only. Do not enter real card information.', editLicence: 'Driving licence', licenceNumber: 'Licence number', expiry: 'Expiry', verifiedStatus: 'Verified document', close: 'Close',
  },
  ru: {
    filters: 'Фильтры', reset: 'Сбросить', apply: 'Показать авто', pickupDate: 'Дата получения', anyDate: 'Любая дата', maxDailyPrice: 'Цена за сутки до', anyPrice: 'Любая цена', brand: 'Марка', anyBrand: 'Любая марка', carClass: 'Класс автомобиля', seats: 'Места', anySeats: 'Любое', filterResults: 'подходящих авто',
    ready: 'Готов к получению', active: 'Активная аренда', completedRental: 'Аренда завершена', confirmedStatus: 'Подтверждено', preparePickup: 'Подготовить к получению', startRental: 'Начать аренду', completeRental: 'Завершить аренду', extendRental: 'Продлить на один день', remaining: 'осталось', returnBy: 'Вернуть до', pickupLocation: 'Место получения', returnLocation: 'Место возврата', mockLifecycle: 'Элементы разработки имитируют этапы аренды.',
    notifications: 'Уведомления', noNotifications: 'Уведомлений пока нет', pickupNotice: 'Напоминание о получении', pickupNoticeBody: 'Автомобиль ожидает получения в центре Грозного.', returnNotice: 'Напоминание о возврате', returnNoticeBody: 'Срок активной аренды приближается к завершению.', extensionNotice: 'Аренда продлена', extensionNoticeBody: 'Добавлен один день, тестовая сумма обновлена.', markAllRead: 'Прочитать все',
    editProfile: 'Изменить профиль', profileDetails: 'Данные профиля', fullName: 'Имя', phone: 'Телефон', saveChanges: 'Сохранить', nameRule: 'Используйте 2–40 букв.', emailRule: 'Введите корректную эл. почту.', phoneRule: 'Введите 10–15 цифр.', editPayment: 'Способ оплаты', cardLabel: 'Название карты', lastFour: 'Последние 4 тестовые цифры', mockOnly: 'Только тестовые данные. Не вводите данные реальной карты.', editLicence: 'Водительские документы', licenceNumber: 'Номер удостоверения', expiry: 'Действует до', verifiedStatus: 'Документ подтверждён', close: 'Закрыть',
  },
} as const;
const tabs = [
  { id: 'explore', icon: IconHome },
  { id: 'trips', icon: IconClock },
  { id: 'saved', icon: IconHeart },
  { id: 'account', icon: IconUser },
] as const;
const spring = { type: 'spring' as const, bounce: 0, duration: 0.38 };
const sheetSpring = { type: 'spring' as const, stiffness: 420, damping: 38, mass: .86 };

function normalizeSearch(value: string) {
  return value.trim().toLocaleLowerCase().replaceAll('ё', 'е');
}

function carBrandLogo(name: string) {
  return carBrandLogos.find(([brand]) => name.startsWith(brand))?.[1] ?? '';
}

function carBrandName(name: string) {
  return carBrandLogos.find(([brand]) => name.startsWith(brand))?.[0] ?? name.split(' ')[0];
}

function carSeats(name: string) {
  return ['Mercedes-Benz G-Class', 'Toyota Land Cruiser', 'Haval M6'].includes(name) ? 7 : 5;
}

function isBookingStatus(value: unknown): value is BookingStatus {
  return value === 'confirmed' || value === 'ready' || value === 'active' || value === 'completed';
}

function statusLabel(locale: Locale, status: BookingStatus) {
  const text = featureText[locale];
  return status === 'ready' ? text.ready : status === 'active' ? text.active : status === 'completed' ? text.completedRental : text.confirmedStatus;
}

function noticeCopy(locale: Locale, notice: AppNotice) {
  const text = featureText[locale];
  return notice.kind === 'pickup'
    ? { title: text.pickupNotice, body: text.pickupNoticeBody }
    : notice.kind === 'return'
      ? { title: text.returnNotice, body: text.returnNoticeBody }
      : { title: text.extensionNotice, body: text.extensionNoticeBody };
}

function sanitizeProfile(value: Partial<ProfileData>): ProfileData {
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

export default function Home() {
  const reduceMotion = useReducedMotion();
  const [locale, setLocale] = useState<Locale>('ru');
  const [theme, setTheme] = useState<Theme>('dark');
  const [signedIn, setSignedIn] = useState(false);
  const [email, setEmail] = useState('developer@carshare.local');
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<TabId>('explore');
  const [tabDirection, setTabDirection] = useState(0);
  const [detailCarId, setDetailCarId] = useState<number | null>(null);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [checkoutCarId, setCheckoutCarId] = useState<number | null>(null);
  const [fleetFilters, setFleetFilters] = useState<FleetFilters>(emptyFleetFilters);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notices, setNotices] = useState<AppNotice[]>([]);
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [payment, setPayment] = useState<PaymentData>(defaultPayment);
  const [licence, setLicence] = useState<LicenceData>(defaultLicence);
  const [toast, setToast] = useState<string | null>(null);
  const [secondaryOverlayOpen, setSecondaryOverlayOpen] = useState(false);
  const [reservationDetailsRequested, setReservationDetailsRequested] = useState(false);
  const [exploreScrolled, setExploreScrolled] = useState(false);
  const [savedIds, setSavedIds] = useState<number[]>([1, 2]);
  const copy = getCopy(locale);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const storedLocale = localStorage.getItem('carshare-language');
      if (storedLocale === 'en' || storedLocale === 'ru') setLocale(storedLocale);
      const storedTheme = localStorage.getItem('carshare-theme');
      if (storedTheme === 'dark' || storedTheme === 'light') setTheme(storedTheme);
      setSignedIn(localStorage.getItem('carshare-dev-session') === 'active');
      try {
        const storedFilters = JSON.parse(localStorage.getItem('carshare-filters') || 'null') as FleetFilters | null;
        if (storedFilters) setFleetFilters({ ...emptyFleetFilters, ...storedFilters });
        const storedNotices = JSON.parse(localStorage.getItem('carshare-notifications') || '[]') as AppNotice[];
        if (Array.isArray(storedNotices)) setNotices(storedNotices);
        setProfile(sanitizeProfile(JSON.parse(localStorage.getItem('carshare-profile') || 'null') || {}));
        setPayment({ ...defaultPayment, ...(JSON.parse(localStorage.getItem('carshare-payment') || 'null') || {}) });
        setLicence({ ...defaultLicence, ...(JSON.parse(localStorage.getItem('carshare-licence') || 'null') || {}) });
      } catch { /* Keep safe development defaults. */ }
      const storedReservation = localStorage.getItem('carshare-reservation');
      if (storedReservation) {
        try {
          const parsed = JSON.parse(storedReservation) as Reservation;
          const reservationCar = cars.find((car) => car.id === parsed.carId);
          if (reservationCar && isValidISODate(parsed.startDate) && isValidRentalDays(parsed.days)) {
            const normalized = { ...parsed, total: reservationCar.price * parsed.days, status: isBookingStatus(parsed.status) ? parsed.status : parsed.startDate <= todayISO() ? 'ready' : 'confirmed' };
            setReservation(normalized);
            localStorage.setItem('carshare-reservation', JSON.stringify(normalized));
          }
          else localStorage.removeItem('carshare-reservation');
        } catch { localStorage.removeItem('carshare-reservation'); }
      } else {
        const legacyId = Number(localStorage.getItem('carshare-reserved-id'));
        const legacyCar = cars.find((car) => car.id === legacyId);
        if (legacyCar) {
          const migrated = createReservation(legacyCar, todayISO(), 1);
          localStorage.setItem('carshare-reservation', JSON.stringify(migrated));
          localStorage.removeItem('carshare-reserved-id');
          setReservation(migrated);
        }
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  const visibleCars = useMemo(() => {
    const normalized = normalizeSearch(query);
    return cars.filter((car) => {
      const matchesCategory = filter === 'All' || car.type === filter;
      const matchesAdvancedClass = fleetFilters.carClass === 'All' || car.type === fleetFilters.carClass;
      const matchesPrice = fleetFilters.maxPrice === null || car.price <= fleetFilters.maxPrice;
      const matchesBrand = fleetFilters.brand === 'All' || carBrandName(car.name) === fleetFilters.brand;
      const searchable = normalizeSearch([
        car.name,
        car.type,
        carTypeLabel('en', car.type),
        carTypeLabel('ru', car.type),
        car.plate,
        carSearchAliases[car.id],
        car.electric ? 'electric ev электромобиль электрический' : 'petrol fuel бензин топливо',
      ].join(' '));
      return matchesCategory && matchesAdvancedClass && matchesPrice && matchesBrand && (!normalized || searchable.includes(normalized));
    });
  }, [filter, fleetFilters, query]);
  const detailCar = cars.find((car) => car.id === detailCarId) ?? null;
  const checkoutCar = cars.find((car) => car.id === checkoutCarId) ?? null;
  const activeFilterCount = [fleetFilters.maxPrice, fleetFilters.brand !== 'All', fleetFilters.carClass !== 'All'].filter(Boolean).length;
  const navCovered = Boolean(detailCar || checkoutCar || showFilterSheet || showNotifications || secondaryOverlayOpen);

  function signIn() {
    setSignedIn(true);
    try { localStorage.setItem('carshare-dev-session', 'active'); } catch { /* Session storage is optional in restricted web views. */ }
  }
  function signOut() {
    setSignedIn(false);
    try { localStorage.removeItem('carshare-dev-session'); } catch { /* Session storage is optional in restricted web views. */ }
  }
  function changeLocale(next: Locale) { localStorage.setItem('carshare-language', next); setLocale(next); }
  function changeTheme(next: Theme) { localStorage.setItem('carshare-theme', next); setTheme(next); }
  function showMessage(message: string) {
    setToast(message);
    window.setTimeout(() => setToast((current) => current === message ? null : current), 2400);
  }
  function addNotice(kind: NoticeKind) {
    setNotices((current) => {
      const next = [{ id: `${kind}-${Date.now()}`, kind, createdAt: new Date().toISOString(), read: false }, ...current];
      localStorage.setItem('carshare-notifications', JSON.stringify(next));
      return next;
    });
  }
  function saveReservation(next: Reservation) {
    localStorage.setItem('carshare-reservation', JSON.stringify(next));
    setReservation(next);
  }
  function advanceReservation() {
    if (!reservation) return;
    const nextStatus: BookingStatus = reservation.status === 'confirmed' ? 'ready' : reservation.status === 'ready' ? 'active' : reservation.status === 'active' ? 'completed' : 'completed';
    saveReservation({ ...reservation, status: nextStatus });
    if (nextStatus === 'ready') addNotice('pickup');
    if (nextStatus === 'active') addNotice('return');
  }
  function extendReservation() {
    if (!reservation || reservation.status !== 'active') return;
    const car = cars.find((item) => item.id === reservation.carId);
    if (!car || reservation.days >= 30) return;
    saveReservation({ ...reservation, days: reservation.days + 1, total: reservation.total + car.price });
    addNotice('extension');
    showMessage(featureText[locale].extensionNotice);
  }
  function saveFleetFilters(next: FleetFilters) {
    localStorage.setItem('carshare-filters', JSON.stringify(next));
    setFleetFilters(next);
    setFilter(next.carClass);
    setShowFilterSheet(false);
  }
  function resetFleetFilters() {
    localStorage.setItem('carshare-filters', JSON.stringify(emptyFleetFilters));
    setFleetFilters(emptyFleetFilters);
    setFilter('All');
  }
  function saveProfile(next: ProfileData) { const safe = sanitizeProfile(next); localStorage.setItem('carshare-profile', JSON.stringify(safe)); setProfile(safe); }
  function savePayment(next: PaymentData) { localStorage.setItem('carshare-payment', JSON.stringify(next)); setPayment(next); }
  function saveLicence(next: LicenceData) { localStorage.setItem('carshare-licence', JSON.stringify(next)); setLicence(next); }
  function markNoticesRead() {
    const next = notices.map((notice) => ({ ...notice, read: true }));
    localStorage.setItem('carshare-notifications', JSON.stringify(next));
    setNotices(next);
  }
  function switchTab(next: TabId) {
    setTabDirection(tabs.findIndex((tab) => tab.id === next) - tabs.findIndex((tab) => tab.id === activeTab));
    setCheckoutCarId(null); setDetailCarId(null); setSecondaryOverlayOpen(false); setActiveTab(next);
  }
  function openReservationDetails() {
    setReservationDetailsRequested(true);
    switchTab('trips');
    setSecondaryOverlayOpen(true);
  }
  function openSavedCar(id: number) { setDetailCarId(id); }
  function toggleSaved(id: number) { setSavedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); }
  function changeFilter(next: string, target?: HTMLButtonElement) {
    const rail = target?.parentElement;

    if (target && rail) {
      const railRect = rail.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const filterButton = rail.parentElement?.querySelector<HTMLButtonElement>('.filter-button');
      const leftRevealEdge = railRect.left + 16;
      const rightRevealEdge = filterButton?.getBoundingClientRect().right ?? railRect.right - 16;
      const hiddenOnLeft = targetRect.left < leftRevealEdge;
      const hiddenOnRight = targetRect.right > rightRevealEdge;

      if (hiddenOnLeft || hiddenOnRight) {
        const revealDistance = hiddenOnLeft
          ? targetRect.left - leftRevealEdge
          : targetRect.right - rightRevealEdge;
        const maxScrollLeft = rail.scrollWidth - rail.clientWidth;
        rail.scrollTo({
          left: Math.min(maxScrollLeft, Math.max(0, rail.scrollLeft + revealDistance)),
          behavior: reduceMotion ? 'auto' : 'smooth',
        });
      }
    }

    if (next !== filter) setFilter(next);
  }
  function confirmReservation(car: Car, startDate: string, days: number) {
    if (!isValidISODate(startDate) || startDate < todayISO() || !isValidRentalDays(days)) return;
    const next = createReservation(car, startDate, days, reservation?.carId === car.id ? reservation.confirmation : undefined);
    saveReservation(next); setCheckoutCarId(null);
  }
  function cancelReservation() { localStorage.removeItem('carshare-reservation'); localStorage.removeItem('carshare-reserved-id'); setReservation(null); }

  if (!signedIn) return (
    <main className="apple-login">
      <motion.section className="apple-login-card" initial={false} animate={{ opacity: 1, y: 0, scale: 1 }} transition={spring} aria-labelledby="login-title">
        <div className="login-symbol"><img draggable={false} src="/valoar-logo.svg" alt="" /></div>
        <div className="login-copy"><h1 id="login-title">{copy.welcome}</h1><p>{copy.welcomeDescription}</p></div>
        <form autoComplete="off" onSubmit={(event) => { event.preventDefault(); signIn(); }}>
          <label htmlFor="dev-email">{copy.email}</label><input id="dev-email" type="text" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} />
          <label htmlFor="dev-access-code">{copy.password}</label><input id="dev-access-code" className="masked-login-input" type="text" defaultValue="carshare" required autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} />
          <motion.button type="button" onClick={signIn} whileTap={{ scale: .98 }} transition={spring}>{copy.continue} <IconChevronRight size={20} /></motion.button>
        </form>
        <p className="privacy-note"><IconShieldCheck size={16} /> {copy.privacy}</p>
      </motion.section>
    </main>
  );

  return (
    <main className="app-shell apple-app">
      <AnimatePresence mode="popLayout" initial={false} custom={tabDirection}>
        <motion.div className="tab-stage" key={activeTab} custom={tabDirection}
          initial={tabDirection === 0 ? false : reduceMotion ? { opacity: 0 } : { x: tabDirection > 0 ? 22 : -22, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { x: tabDirection > 0 ? -22 : 22, opacity: 0 }} transition={spring}>
          {activeTab === 'explore' ? (
            <section className="explore-page" aria-labelledby="fleet-title" onScroll={(event) => {
              const scrollArea = event.currentTarget;
              const searchRow = scrollArea.querySelector<HTMLElement>('.search-row');
              if (!searchRow) return;
              setExploreScrolled(searchRow.getBoundingClientRect().top <= scrollArea.getBoundingClientRect().top + 1);
            }}>
              <header className="apple-header"><div className="apple-brand"><span><img draggable={false} src="/valoar-logo.svg" alt="" /></span>CarShare</div><motion.button className="explore-notifications" whileTap={{ scale: .9 }} transition={spring} onClick={() => setShowNotifications(true)} aria-label={`${featureText[locale].notifications}${notices.filter((notice) => !notice.read).length ? ` · ${notices.filter((notice) => !notice.read).length}` : ''}`} aria-haspopup="dialog"><IconBell size={20} />{notices.some((notice) => !notice.read) && <span>{notices.filter((notice) => !notice.read).length}</span>}</motion.button></header>
              <div className="title-block"><button className="location-label"><IconNavigation size={13} fill="currentColor" /> {copy.grozny} <IconChevronRight size={14} /></button><h1 id="fleet-title">{copy.availableNearby}</h1><p>{visibleCars.length} {copy.readyToDrive}</p></div>
              <div className={`search-row ${exploreScrolled ? 'scrolled' : ''}`}><div className="apple-search"><IconSearch size={19} /><input ref={searchInputRef} value={query} onChange={(event) => setQuery(event.target.value)} aria-label={copy.searchAvailableCars} placeholder={copy.searchCars} /><AnimatePresence>{query && <motion.button type="button" className="search-clear" aria-label={copy.clearSearch} onClick={(event) => { event.preventDefault(); setQuery(''); searchInputRef.current?.blur(); event.currentTarget.blur(); }} initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: .72, x: 6 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: .72, x: 6 }} transition={spring} whileTap={{ scale: .86 }}><IconX size={14} strokeWidth={2.4} /></motion.button>}</AnimatePresence></div><button className={`filter-button ${activeFilterCount ? 'active' : ''}`} aria-label={copy.adjustFilters} onClick={() => setShowFilterSheet(true)}><IconAdjustmentsHorizontal size={21} />{activeFilterCount > 0 && <span>{activeFilterCount}</span>}</button></div>
              <div className="apple-filters" aria-label={copy.taxiFilters}>{filters.map((item) => <motion.button key={item} onClick={(event) => changeFilter(item, event.currentTarget)} className={filter === item ? 'active' : ''} whileTap={{ scale: .96 }} transition={spring}>{item === 'All' ? copy.allCars : carTypeLabel(locale, item)}</motion.button>)}</div>
              <div className="section-heading"><h2>{copy.closestCars}</h2></div>
              <div className="vehicle-list">
                <AnimatePresence initial={false} mode="wait">
                  <motion.div className="vehicle-set" key={`${filter}:${query.trim().toLowerCase()}:${JSON.stringify(fleetFilters)}`}
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }} transition={{ duration: reduceMotion ? .01 : .18, ease: 'easeOut' }}>
                    {visibleCars.map((car, index) => <motion.article className="vehicle-card" key={car.id} role="button" tabIndex={0} onClick={() => setDetailCarId(car.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setDetailCarId(car.id); }} aria-label={`${copy.openDetails} ${car.name}`} initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ ...spring, delay: reduceMotion ? 0 : index * .045 }} whileTap={{ scale: .985 }}>
                      <div className="vehicle-photo"><img draggable={false} src={car.image} alt={car.name} /><span className="brand-badge" aria-hidden="true"><img draggable={false} src={carBrandLogo(car.name)} alt="" /></span></div>
                      <div className="vehicle-copy"><div className="vehicle-topline"><span>{car.electric && <IconBolt size={12} fill="currentColor" />}{carTypeLabel(locale, car.type)}</span><button className={savedIds.includes(car.id) ? 'saved' : ''} onClick={(event) => { event.stopPropagation(); toggleSaved(car.id); }} aria-label={`${savedIds.includes(car.id) ? copy.remove : copy.save} ${car.name}`}><IconHeart size={19} fill={savedIds.includes(car.id) ? 'currentColor' : 'none'} /></button></div><h3>{car.name}</h3><p>{car.plate}</p><div className="vehicle-footer"><strong>₽{car.price.toLocaleString('ru-RU')}</strong></div></div>
                    </motion.article>)}
                    {!visibleCars.length && <div className="empty-state"><IconSearch size={28} /><h3>{copy.noCars}</h3><p>{copy.tryAnother}</p></div>}
                  </motion.div>
                </AnimatePresence>
              </div>
            </section>
          ) : <SecondaryPage activeTab={activeTab} savedIds={savedIds} signOut={signOut} openSavedCar={openSavedCar} toggleSaved={toggleSaved} reservation={reservation} reservationCar={cars.find((car) => car.id === reservation?.carId) ?? null} reservationDetailsRequested={reservationDetailsRequested} clearReservationDetailsRequest={() => setReservationDetailsRequested(false)} modifyReservation={(id) => setCheckoutCarId(id)} cancelReservation={cancelReservation} advanceReservation={advanceReservation} extendReservation={extendReservation} onOverlayVisibilityChange={setSecondaryOverlayOpen} locale={locale} changeLocale={changeLocale} theme={theme} changeTheme={changeTheme} notices={notices} markNoticesRead={markNoticesRead} profile={profile} payment={payment} licence={licence} saveProfile={saveProfile} savePayment={savePayment} saveLicence={saveLicence} />}
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>{detailCar && <motion.section className="car-detail apple-detail" aria-labelledby="car-detail-title" initial={reduceMotion ? { opacity: 0 } : { x: '100%' }} animate={{ x: 0, opacity: 1 }} exit={reduceMotion ? { opacity: 0 } : { x: '100%' }} transition={spring}>
        <div className="detail-hero"><img draggable={false} src={detailCar.image} alt={detailCar.name} /><div className="detail-scrim" /><motion.button className="detail-glass-button detail-back" whileTap={{ scale: .9 }} onClick={() => setDetailCarId(null)} aria-label={copy.backPrevious}><IconArrowLeft size={23} /></motion.button><motion.button className={`detail-glass-button detail-save ${savedIds.includes(detailCar.id) ? 'saved' : ''}`} whileTap={{ scale: .9 }} onClick={() => toggleSaved(detailCar.id)} aria-label={`${copy.save} ${detailCar.name}`}><IconHeart size={21} fill={savedIds.includes(detailCar.id) ? 'currentColor' : 'none'} /></motion.button><div className="detail-hero-copy"><span>{detailCar.electric && <IconBolt size={12} fill="currentColor" />}{carTypeLabel(locale, detailCar.type)}</span><h1 id="car-detail-title">{detailCar.name}</h1><p><IconMapPin size={14} /> {minuteCount(locale, detailCar.walk, true)} · {copy.centralGrozny}</p></div></div>
        <div className="detail-content"><div className="detail-price"><div><span>{copy.dailyRental}</span><strong>₽{detailCar.price.toLocaleString('ru-RU')}<small>/{locale === 'ru' ? 'сутки' : 'day'}</small></strong></div><span className="detail-available"><i />{copy.availableNow}</span></div><div className="detail-metrics"><div><IconGauge size={21} /><span>{copy.range}<strong>{detailCar.range} {locale === 'ru' ? 'км' : 'km'}</strong></span></div><div><IconBattery size={21} /><span>{detailCar.electric ? copy.charge : copy.fuel}<strong>{detailCar.electric ? '82%' : '74%'}</strong></span></div><div><IconUsers size={21} /><span>{copy.seats}<strong>{carSeats(detailCar.name)} {copy.people}</strong></span></div></div><section className="detail-section"><h2>{copy.readyCity}</h2><p>{copy.readyCityDescription}</p></section><section className="detail-section"><h2>{copy.included}</h2><div className="feature-list"><span><IconShieldCheck size={19} />{copy.comprehensiveInsurance}</span><span><IconCar size={19} />{copy.fuelParking}</span><span><IconRoute size={19} />{copy.roadsideSupport}</span></div></section><section className="detail-section detail-location"><h2>{copy.pickup}</h2><div><IconMapPin size={20} /><span><strong>{copy.centralGrozny}</strong><small>{detailCar.walk} {copy.exactAfterReservation}</small></span></div></section></div>
        <div className="detail-action"><motion.button className={`detail-reserve ${reservation?.carId === detailCar.id ? 'reserved' : ''}`} whileTap={{ scale: .98 }} transition={spring} onClick={() => reservation?.carId === detailCar.id ? openReservationDetails() : setCheckoutCarId(detailCar.id)} aria-haspopup="dialog"><span>{reservation?.carId === detailCar.id ? copy.viewReservationDetails : copy.reserveCar}</span><b>{reservation?.carId === detailCar.id ? <IconChevronRight size={18} /> : `₽${detailCar.price.toLocaleString('ru-RU')}/${locale === 'ru' ? 'сутки' : 'day'}`}</b></motion.button></div>
      </motion.section>}</AnimatePresence>
      <nav className={`apple-tabbar ${navCovered ? 'covered' : ''}`} aria-label={copy.mainNavigation} aria-hidden={navCovered}>{tabs.map((tab) => { const Icon = tab.icon; const isActive = activeTab === tab.id; return <motion.button key={tab.id} onClick={() => switchTab(tab.id)} className={isActive ? 'active' : ''} aria-current={isActive ? 'page' : undefined} tabIndex={navCovered ? -1 : 0} whileTap={{ scale: .92 }} transition={spring}>{isActive && <motion.span className="tab-selection" layoutId="tab-selection" transition={spring} />}<span className="tab-icon"><Icon size={22} stroke={isActive ? 2 : 1.7} fill={isActive && tab.id === 'saved' ? 'currentColor' : 'none'} /></span><small>{copy[tab.id]}</small></motion.button>; })}</nav>
      <AnimatePresence>
        {checkoutCar && <ReservationCheckout car={checkoutCar} existingReservation={reservation?.carId === checkoutCar.id ? reservation : null} payment={payment} reduceMotion={!!reduceMotion} onClose={() => setCheckoutCarId(null)} onConfirm={(startDate, days) => confirmReservation(checkoutCar, startDate, days)} locale={locale} />}
        {showFilterSheet && <FleetFilterSheet current={fleetFilters} resultCount={visibleCars.length} locale={locale} reduceMotion={!!reduceMotion} onClose={() => setShowFilterSheet(false)} onApply={saveFleetFilters} onReset={resetFleetFilters} />}
        {showNotifications && <AccountSheet kind="notifications" locale={locale} reduceMotion={!!reduceMotion} profile={profile} payment={payment} licence={licence} notices={notices} onClose={() => setShowNotifications(false)} onSaveProfile={saveProfile} onSavePayment={savePayment} onSaveLicence={saveLicence} onMarkRead={markNoticesRead} />}
      </AnimatePresence>
      <AnimatePresence>{toast && <motion.div className="app-toast" role="status" initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }} transition={spring}><IconCheck size={17} />{toast}</motion.div>}</AnimatePresence>
    </main>
  );
}

function FleetFilterSheet({ current, locale, reduceMotion, onClose, onApply, onReset }: { current: FleetFilters; resultCount: number; locale: Locale; reduceMotion: boolean; onClose: () => void; onApply: (filters: FleetFilters) => void; onReset: () => void }) {
  const [draft, setDraft] = useState(current);
  const [showBrands, setShowBrands] = useState(false);
  const [brandFocused, setBrandFocused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const brandTimer = useRef<number | null>(null);
  const text = featureText[locale];
  const brands = useMemo(() => Array.from(new Set(cars.map((car) => carBrandName(car.name)))).sort(), []);
  const resultCount = cars.filter((car) => (draft.maxPrice === null || car.price <= draft.maxPrice) && (draft.brand === 'All' || carBrandName(car.name) === draft.brand) && (draft.carClass === 'All' || car.type === draft.carClass)).length;
  const priceMin = 3000;
  const priceMax = 19000;
  const priceValue = draft.maxPrice ?? priceMax;
  const priceProgress = ((priceValue - priceMin) / (priceMax - priceMin)) * 100;
  useEffect(() => () => { if (brandTimer.current !== null) window.clearTimeout(brandTimer.current); }, []);
  function openBrandPicker() {
    if (brandTimer.current !== null) window.clearTimeout(brandTimer.current);
    setBrandFocused(true);
    scrollRef.current?.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    brandTimer.current = window.setTimeout(() => setShowBrands(true), reduceMotion ? 0 : 210);
  }
  function closeBrandPicker() {
    if (brandTimer.current !== null) window.clearTimeout(brandTimer.current);
    setShowBrands(false);
    brandTimer.current = window.setTimeout(() => setBrandFocused(false), reduceMotion ? 0 : 210);
  }
  function chooseBrand(brand: string) {
    setDraft((currentDraft) => ({ ...currentDraft, brand }));
    closeBrandPicker();
  }
  return <motion.div className="reservation-overlay feature-overlay filter-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? .01 : .22 }} onClick={onClose}>
    <motion.section className="feature-sheet filter-sheet" role="dialog" aria-modal="true" aria-labelledby="filter-sheet-title" initial={reduceMotion ? { opacity: 0 } : { y: 42, scale: .985, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={reduceMotion ? { opacity: 0 } : { y: 24, opacity: 0 }} transition={reduceMotion ? { duration: .01 } : sheetSpring} onClick={(event) => event.stopPropagation()}>
      <header className="feature-sheet-header"><div><span>{resultCount} {text.filterResults}</span><h2 id="filter-sheet-title">{text.filters}</h2></div><motion.button whileTap={{ scale: .9 }} onClick={onClose} aria-label={text.close}><IconX size={21} /></motion.button></header>
      <div className={`feature-sheet-scroll filter-focus-stage ${brandFocused ? 'brand-focused' : ''}`} ref={scrollRef}>
        <AnimatePresence initial={false} mode="popLayout">
          {!brandFocused && <motion.section layout className="filter-group price-filter" key="price-filter" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={reduceMotion ? { duration: .01 } : { ...spring, duration: .2 }}><h3><span>{text.maxDailyPrice}</span><strong>{draft.maxPrice === null ? text.anyPrice : `₽${draft.maxPrice.toLocaleString('ru-RU')}`}</strong></h3><div className="price-slider-wrap"><input type="range" min={priceMin} max={priceMax} step={100} value={priceValue} aria-label={text.maxDailyPrice} onChange={(event) => { const value = Number(event.target.value); setDraft({ ...draft, maxPrice: value === priceMax ? null : value }); }} style={{ '--price-progress': `${priceProgress}%` } as CSSProperties} /><div><span>₽{priceMin.toLocaleString('ru-RU')}</span><span>{text.anyPrice}</span></div></div></motion.section>}
        </AnimatePresence>
        <motion.section layout="position" className={`filter-group brand-filter ${brandFocused ? 'focused' : ''}`} transition={reduceMotion ? { duration: .01 } : { ...spring, duration: .2 }}><h3>{text.brand}</h3><motion.button type="button" className={`brand-picker ${showBrands ? 'open' : ''}`} whileTap={{ scale: .985 }} transition={spring} onClick={() => brandFocused ? closeBrandPicker() : openBrandPicker()} aria-label={text.brand} aria-haspopup="listbox" aria-expanded={showBrands}><span className="brand-picker-value"><span className="brand-option-logo" aria-hidden="true">{draft.brand === 'All' ? <IconCar size={17} /> : <img draggable={false} src={carBrandLogo(draft.brand)} alt="" />}</span><span>{draft.brand === 'All' ? text.anyBrand : draft.brand}</span></span><motion.span className="brand-picker-chevron" animate={{ rotate: showBrands ? 180 : 0 }} transition={{ duration: reduceMotion ? .01 : .2 }}><IconChevronDown size={17} /></motion.span></motion.button><AnimatePresence initial={false}>{showBrands && <motion.div className="brand-picker-menu" role="listbox" aria-label={text.brand} initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12, scaleY: .92 }} animate={{ opacity: 1, y: 0, scaleY: 1 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, scaleY: .94 }} transition={reduceMotion ? { duration: .01 } : { ...spring, duration: .2 }} style={{ transformOrigin: 'top' }}><motion.button type="button" role="option" aria-selected={draft.brand === 'All'} className={draft.brand === 'All' ? 'selected' : ''} whileTap={{ scale: .98 }} transition={spring} onClick={() => chooseBrand('All')}><span className="brand-option-name"><span className="brand-option-logo" aria-hidden="true"><IconCar size={17} /></span><span>{text.anyBrand}</span></span>{draft.brand === 'All' && <IconCheck size={16} />}</motion.button>{brands.map((brand) => <motion.button type="button" role="option" aria-selected={draft.brand === brand} className={draft.brand === brand ? 'selected' : ''} whileTap={{ scale: .98 }} transition={spring} key={brand} onClick={() => chooseBrand(brand)}><span className="brand-option-name"><span className="brand-option-logo" aria-hidden="true"><img draggable={false} src={carBrandLogo(brand)} alt="" /></span><span>{brand}</span></span>{draft.brand === brand && <IconCheck size={16} />}</motion.button>)}</motion.div>}</AnimatePresence></motion.section>
        <AnimatePresence initial={false} mode="popLayout">
          {!brandFocused && <motion.div className="filter-tail" key="filter-tail" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={reduceMotion ? { duration: .01 } : { ...spring, duration: .2 }}><section className="filter-group class-filter"><h3>{text.carClass}</h3><div className="choice-grid">{filters.map((item) => <motion.button whileTap={{ scale: .96 }} transition={spring} key={item} className={draft.carClass === item ? 'active' : ''} onClick={() => setDraft({ ...draft, carClass: item })}>{item === 'All' ? getCopy(locale).allCars : carTypeLabel(locale, item)}</motion.button>)}</div></section><motion.button type="button" className="inline-reset-action" whileTap={{ scale: .98 }} transition={spring} onClick={() => { setDraft(emptyFleetFilters); onReset(); }}>{text.reset}</motion.button></motion.div>}
        </AnimatePresence>
      </div>
      <div className="feature-sheet-actions"><motion.button className="primary-action" whileTap={{ scale: .98 }} transition={spring} onClick={() => onApply(draft)}>{text.apply} · {resultCount}</motion.button></div>
    </motion.section>
  </motion.div>;
}

function ReservationCheckout({ car, existingReservation, payment, reduceMotion, onClose, onConfirm, locale }: { car: Car; existingReservation: Reservation | null; payment: PaymentData; reduceMotion: boolean; onClose: () => void; onConfirm: (startDate: string, days: number) => void; locale: Locale }) {
  const pickupDates = useMemo(() => Array.from({ length: 30 }, (_, index) => addDaysISO(todayISO(), index)).filter(Boolean), []);
  const [startDate, setStartDate] = useState(() => existingReservation?.startDate && pickupDates.includes(existingReservation.startDate) ? existingReservation.startDate : pickupDates[0]);
  const [days, setDays] = useState(existingReservation?.days ?? 1);
  const [showDateMenu, setShowDateMenu] = useState(false);
  const total = car.price * days;
  const validStartDate = isValidISODate(startDate) && startDate >= todayISO();
  const copy = getCopy(locale);
  return <motion.div className="reservation-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? .01 : .24, ease: 'easeOut' }} onClick={onClose}>
    <motion.section className="reservation-sheet" role="dialog" aria-modal="true" aria-labelledby="reservation-title" initial={reduceMotion ? { opacity: 0 } : { y: 52, scale: .985, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={reduceMotion ? { opacity: 0 } : { y: 28, scale: .99, opacity: 0 }} transition={reduceMotion ? { duration: .01 } : sheetSpring} onClick={(event) => { event.stopPropagation(); if (showDateMenu) setShowDateMenu(false); }}>
      <header className="reservation-header"><div><span>{locale === 'ru' ? `${dayCount(locale, days)} аренды` : `${days}-day rental`}</span><h2 id="reservation-title">{existingReservation ? copy.modifyReservation : copy.confirmReservation}</h2></div><motion.button whileTap={{ scale: .9 }} onClick={onClose} aria-label={copy.closeReservation} autoFocus><IconX size={21} /></motion.button></header>
      <div className="reservation-scroll-content">
      <div className="reservation-car"><img draggable={false} src={car.image} alt="" /><div><span>{carTypeLabel(locale, car.type)}</span><strong>{car.name}</strong><small>{car.plate} · {copy.centralGrozny}</small></div></div>
      <section className="checkout-section"><h3>{copy.rentalDates}</h3><div className="rental-controls"><div className={`pickup-control ${showDateMenu ? 'open' : ''}`}><span>{copy.pickupDate}</span><motion.button type="button" whileTap={{ scale: .97 }} onClick={(event) => { event.stopPropagation(); setShowDateMenu((current) => !current); }} aria-label={copy.pickupDate} aria-haspopup="listbox" aria-expanded={showDateMenu}><strong>{formatPickupDate(startDate, locale)}</strong><motion.span animate={{ rotate: showDateMenu ? 180 : 0 }} transition={{ duration: reduceMotion ? .01 : .2 }}><IconChevronDown size={16} /></motion.span></motion.button><AnimatePresence>{showDateMenu && <motion.div className="ios-date-menu" role="listbox" aria-label={copy.choosePickupDate} initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -5, scale: .98 }} transition={reduceMotion ? { duration: .01 } : sheetSpring} onClick={(event) => event.stopPropagation()} onKeyDown={(event) => { if (event.key === 'Escape') setShowDateMenu(false); }}>{pickupDates.map((date) => <button type="button" key={date} role="option" aria-selected={date === startDate} className={date === startDate ? 'selected' : ''} autoFocus={date === startDate} onClick={() => { setStartDate(date); setShowDateMenu(false); }}><span>{formatPickupDate(date, locale)}</span>{date === startDate && <IconCheck size={17} />}</button>)}</motion.div>}</AnimatePresence></div><div className="duration-control"><span>{copy.rentalLength}</span><div><motion.button whileTap={{ scale: .9 }} onClick={() => setDays((current) => Math.max(1, current - 1))} disabled={days === 1} aria-label={copy.decreaseRental}>−</motion.button><strong>{dayCount(locale, days)}</strong><motion.button whileTap={{ scale: .9 }} onClick={() => setDays((current) => Math.min(30, current + 1))} disabled={days === 30} aria-label={copy.increaseRental}>+</motion.button></div></div></div><p className={`rental-date-range ${validStartDate ? '' : 'invalid'}`}><IconClock size={16} /> {validStartDate ? <>{formatRentalDate(startDate, locale)} → {formatRentalDate(addDaysISO(startDate, days), locale)}</> : copy.chooseValidDate}</p></section>
      <section className="checkout-section"><h3>{copy.paymentMethod}</h3><div className="mock-payment"><span className="mock-card-icon"><IconCreditCard size={21} /></span><div><strong>{payment.label}</strong><small>TEST •••• {payment.last4}</small></div><span className="selected-payment"><IconCheck size={16} /></span></div><p><IconShieldCheck size={16} /> {copy.developmentPayment}</p></section>
      <section className="checkout-section"><h3>{copy.paymentSummary}</h3><div className="checkout-receipt"><div><span>{copy.rental} · {dayCount(locale, days)}</span><b>₽{total.toLocaleString('ru-RU')}</b></div><div><span>{copy.refundableDeposit}</span><b>₽0</b></div><div><strong>{copy.total}</strong><strong>₽{total.toLocaleString('ru-RU')}</strong></div></div></section>
      </div>
      <motion.button className="confirm-reservation" whileTap={{ scale: .98 }} transition={spring} onClick={() => onConfirm(startDate, days)} disabled={!validStartDate}><span>{existingReservation ? copy.updateReservation : copy.confirmReservation}</span><b>{copy.mockPay} ₽{total.toLocaleString('ru-RU')}</b></motion.button>
    </motion.section>
  </motion.div>;
}

function SecondaryPage({ activeTab, savedIds, signOut, openSavedCar, toggleSaved, reservation, reservationCar, reservationDetailsRequested, clearReservationDetailsRequest, modifyReservation, cancelReservation, advanceReservation, extendReservation, onOverlayVisibilityChange, locale, changeLocale, theme, changeTheme, notices, markNoticesRead, profile, payment, licence, saveProfile, savePayment, saveLicence }: { activeTab: Exclude<TabId, 'explore'>; savedIds: number[]; signOut: () => void; openSavedCar: (id: number) => void; toggleSaved: (id: number) => void; reservation: Reservation | null; reservationCar: Car | null; reservationDetailsRequested: boolean; clearReservationDetailsRequest: () => void; modifyReservation: (id: number) => void; cancelReservation: () => void; advanceReservation: () => void; extendReservation: () => void; onOverlayVisibilityChange: (open: boolean) => void; locale: Locale; changeLocale: (locale: Locale) => void; theme: Theme; changeTheme: (theme: Theme) => void; notices: AppNotice[]; markNoticesRead: () => void; profile: ProfileData; payment: PaymentData; licence: LicenceData; saveProfile: (profile: ProfileData) => void; savePayment: (payment: PaymentData) => void; saveLicence: (licence: LicenceData) => void }) {
  const reduceMotion = useReducedMotion();
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showFinances, setShowFinances] = useState(false);
  const [showReservation, setShowReservation] = useState(false);
  const [accountSheet, setAccountSheet] = useState<AccountSheetKind | null>(null);
  const totalSpend = trips.reduce((sum, trip) => sum + trip.price, 0);
  const totalDays = trips.reduce((sum, trip) => sum + trip.days, 0);
  const totalDistance = trips.reduce((sum, trip) => sum + trip.distance, 0);
  const copy = getCopy(locale);

  return <section className="secondary-page" aria-labelledby={`${activeTab}-title`}>
    <header className="secondary-header"><div><span>CarShare</span><h1 id={`${activeTab}-title`}>{copy[activeTab]}</h1></div></header>
    {activeTab === 'trips' && <div className="secondary-content">
      {reservation && reservationCar && <><div className="section-heading upcoming-heading"><h2>{statusLabel(locale, reservation.status)}</h2></div><motion.button className={`upcoming-reservation status-${reservation.status}`} onClick={() => { onOverlayVisibilityChange(true); setShowReservation(true); }} whileTap={{ scale: .985 }} transition={spring} aria-label={`${copy.openReservation} ${reservationCar.name}`}><div className="upcoming-car-image"><img draggable={false} src={reservationCar.image} alt="" /></div><div><span>{statusLabel(locale, reservation.status)}</span><strong>{reservationCar.name}</strong><small>{formatRentalDate(reservation.startDate, locale)} · {dayCount(locale, reservation.days)}</small><p>{copy.centralGrozny}</p></div><IconChevronRight size={18} /></motion.button></>}
      <motion.button className="activity-card activity-card-button" onClick={() => { onOverlayVisibilityChange(true); setShowFinances(true); }} whileTap={{ scale: .985 }} transition={spring} aria-label={copy.openTripActivity}>
        <div><span>{copy.augustActivity}</span><strong>{dayCount(locale, totalDays)}</strong><p>{copy.across} {tripCount(locale, trips.length)}</p><small>{copy.viewSpending} <IconChevronRight size={14} /></small></div>
        <div className="activity-ring"><span>₽{totalSpend.toLocaleString('ru-RU')}</span><small>{copy.total.toLocaleLowerCase()}</small></div>
      </motion.button>
      <div className="section-heading"><h2>{copy.recentTrips}</h2><button onClick={() => { onOverlayVisibilityChange(true); setShowFinances(true); }}>{copy.seeAll} <IconChevronRight size={15} /></button></div>
      <div className="grouped-list">{trips.slice(0, 2).map((trip) => <motion.button className="trip-row" key={trip.id} onClick={() => { onOverlayVisibilityChange(true); setSelectedTrip(trip); }} whileTap={{ backgroundColor: 'rgba(255,255,255,.07)' }} transition={spring} aria-label={`${copy.openTrip} ${trip.car}`}><span className="row-icon green"><IconCheck size={18} /></span><div><strong>{trip.car}</strong><p>{tripDate(locale, trip.date)} · {dayCount(locale, trip.days)}</p><small>{tripPlace(locale, trip.from)} → {tripPlace(locale, trip.to)}</small></div><span className="trip-price">₽{trip.price.toLocaleString('ru-RU')}<IconChevronRight size={16} /></span></motion.button>)}</div>
    </div>}
    {activeTab === 'saved' && <div className="secondary-content"><p className="page-intro">{copy.savedDescription}</p><div className="vehicle-list"><motion.div className="vehicle-set saved-vehicle-set" layout transition={spring}><AnimatePresence initial={false} mode="popLayout">{cars.filter((car) => savedIds.includes(car.id)).map((car, index) => <motion.article layout className="vehicle-card" key={car.id} role="button" tabIndex={0} onClick={() => openSavedCar(car.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') openSavedCar(car.id); }} aria-label={`${copy.openDetails} ${car.name}`} initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: .96 }} transition={{ ...spring, delay: reduceMotion ? 0 : index * .045 }} whileTap={{ scale: .985 }}><div className="vehicle-photo"><img draggable={false} src={car.image} alt={car.name} /><span className="brand-badge" aria-hidden="true"><img draggable={false} src={carBrandLogo(car.name)} alt="" /></span></div><div className="vehicle-copy"><div className="vehicle-topline"><span>{car.electric && <IconBolt size={12} fill="currentColor" />}{carTypeLabel(locale, car.type)}</span><button className="saved" onClick={(event) => { event.stopPropagation(); toggleSaved(car.id); }} aria-label={`${copy.remove} ${car.name}`}><IconHeart size={19} fill="currentColor" /></button></div><h3>{car.name}</h3><p>{car.plate}</p><div className="vehicle-footer"><strong>₽{car.price.toLocaleString('ru-RU')}</strong></div></div></motion.article>)}</AnimatePresence></motion.div></div></div>}
    {activeTab === 'account' && <div className="secondary-content"><motion.button className="profile-card profile-card-button" whileTap={{ scale: .985 }} onClick={() => { onOverlayVisibilityChange(true); setAccountSheet('profile'); }}><div className="large-avatar">{profile.name.trim().charAt(0).toUpperCase() || 'N'}</div><div><strong>{profile.name}</strong><span>{profile.email}</span></div><IconChevronRight size={19} /></motion.button><div className="section-heading"><h2>{copy.preferences}</h2></div><div className="grouped-list settings-list"><button onClick={() => { onOverlayVisibilityChange(true); setAccountSheet('payment'); }}><span className="row-icon blue"><IconCreditCard size={18} /></span><div><strong>{copy.paymentMethod}</strong><small>{payment.label} ·· {payment.last4}</small></div><IconChevronRight size={18} /></button><button onClick={() => { onOverlayVisibilityChange(true); setAccountSheet('licence'); }}><span className="row-icon purple"><IconId size={18} /></span><div><strong>{copy.drivingDocuments}</strong><small>{licence.verified ? copy.verified : licence.expiry}</small></div><IconChevronRight size={18} /></button><div className="language-setting appearance-setting"><span className="row-icon indigo">{theme === 'dark' ? <IconMoon size={18} /> : <IconSun size={18} />}</span><div><strong>{copy.appearance}</strong><small>{theme === 'dark' ? copy.dark : copy.light}</small></div><div className="language-switch appearance-switch" role="group" aria-label={copy.appearance}><button type="button" className={theme === 'dark' ? 'active' : ''} aria-label={copy.dark} aria-pressed={theme === 'dark'} onClick={() => changeTheme('dark')}><IconMoon size={16} /></button><button type="button" className={theme === 'light' ? 'active' : ''} aria-label={copy.light} aria-pressed={theme === 'light'} onClick={() => changeTheme('light')}><IconSun size={16} /></button></div></div><div className="language-setting"><span className="row-icon language"><IconLanguage size={18} /></span><div><strong>{copy.language}</strong><small>{locale === 'en' ? copy.english : copy.russian}</small></div><div className="language-switch language-code-switch" role="group" aria-label={copy.language}><button type="button" className={locale === 'en' ? 'active' : ''} aria-label={copy.english} aria-pressed={locale === 'en'} onClick={() => changeLocale('en')}><span aria-hidden="true">EN</span></button><button type="button" className={locale === 'ru' ? 'active' : ''} aria-label={copy.russian} aria-pressed={locale === 'ru'} onClick={() => changeLocale('ru')}><span aria-hidden="true">RU</span></button></div></div></div><button className="apple-signout" onClick={signOut}><IconLogout size={18} /> {copy.signOut}</button></div>}

    <AnimatePresence>
      {(showReservation || reservationDetailsRequested) && reservation && reservationCar && <ReservationDetail reservation={reservation} car={reservationCar} payment={payment} reduceMotion={!!reduceMotion} onClose={() => { onOverlayVisibilityChange(false); setShowReservation(false); clearReservationDetailsRequest(); }} onModify={() => { onOverlayVisibilityChange(false); setShowReservation(false); clearReservationDetailsRequest(); modifyReservation(reservationCar.id); }} onCancel={() => { onOverlayVisibilityChange(false); cancelReservation(); setShowReservation(false); clearReservationDetailsRequest(); }} onAdvance={advanceReservation} onExtend={extendReservation} locale={locale} />}
      {selectedTrip && <TripDetail trip={selectedTrip} reduceMotion={!!reduceMotion} onClose={() => { onOverlayVisibilityChange(false); setSelectedTrip(null); }} locale={locale} />}
      {showFinances && <FinanceDetail totalSpend={totalSpend} totalDays={totalDays} totalDistance={totalDistance} reduceMotion={!!reduceMotion} onClose={() => { onOverlayVisibilityChange(false); setShowFinances(false); }} onSelectTrip={(trip) => { setShowFinances(false); setSelectedTrip(trip); }} locale={locale} />}
      {accountSheet && <AccountSheet kind={accountSheet} locale={locale} reduceMotion={!!reduceMotion} profile={profile} payment={payment} licence={licence} notices={notices} onClose={() => { onOverlayVisibilityChange(false); setAccountSheet(null); }} onSaveProfile={(next) => { saveProfile(next); onOverlayVisibilityChange(false); setAccountSheet(null); }} onSavePayment={(next) => { savePayment(next); onOverlayVisibilityChange(false); setAccountSheet(null); }} onSaveLicence={(next) => { saveLicence(next); onOverlayVisibilityChange(false); setAccountSheet(null); }} onMarkRead={markNoticesRead} />}
    </AnimatePresence>
  </section>;
}

function AccountSheet({ kind, locale, reduceMotion, profile, payment, licence, notices, onClose, onSaveProfile, onSavePayment, onSaveLicence, onMarkRead }: { kind: AccountSheetKind; locale: Locale; reduceMotion: boolean; profile: ProfileData; payment: PaymentData; licence: LicenceData; notices: AppNotice[]; onClose: () => void; onSaveProfile: (profile: ProfileData) => void; onSavePayment: (payment: PaymentData) => void; onSaveLicence: (licence: LicenceData) => void; onMarkRead: () => void }) {
  const [profileDraft, setProfileDraft] = useState(profile);
  const [paymentDraft, setPaymentDraft] = useState(payment);
  const [licenceDraft, setLicenceDraft] = useState(licence);
  const text = featureText[locale];
  const title = kind === 'profile' ? text.editProfile : kind === 'payment' ? text.editPayment : kind === 'licence' ? text.editLicence : text.notifications;
  const cleanName = profileDraft.name.trim().replace(/\s+/g, ' ');
  const phoneDigits = profileDraft.phone.replace(/\D/g, '');
  const profileValidity = {
    name: /^[\p{L}][\p{L}\s'’-]{1,39}$/u.test(cleanName),
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileDraft.email.trim()),
    phone: phoneDigits.length >= 10 && phoneDigits.length <= 15,
  };
  const profileIsValid = profileValidity.name && profileValidity.email && profileValidity.phone;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (kind === 'profile' && profileIsValid) onSaveProfile({ name: cleanName, email: profileDraft.email.trim(), phone: profileDraft.phone.trim() });
    if (kind === 'payment') onSavePayment(paymentDraft);
    if (kind === 'licence') onSaveLicence(licenceDraft);
  }
  return <motion.div className="reservation-overlay feature-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? .01 : .22 }} onClick={onClose}>
    <motion.section className="feature-sheet account-sheet" role="dialog" aria-modal="true" aria-labelledby="account-sheet-title" initial={reduceMotion ? { opacity: 0 } : { y: 42, scale: .985, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={reduceMotion ? { opacity: 0 } : { y: 24, opacity: 0 }} transition={reduceMotion ? { duration: .01 } : sheetSpring} onClick={(event) => event.stopPropagation()}>
      <header className="feature-sheet-header"><div><span>CarShare</span><h2 id="account-sheet-title">{title}</h2></div><motion.button whileTap={{ scale: .9 }} onClick={onClose} aria-label={text.close}><IconX size={21} /></motion.button></header>
      {kind === 'notifications' ? <div className="notification-center">{notices.length ? notices.map((notice) => { const item = noticeCopy(locale, notice); return <article key={notice.id} className={notice.read ? 'read' : ''}><span><IconBell size={17} /></span><div><strong>{item.title}</strong><p>{item.body}</p><small>{new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(notice.createdAt))}</small></div></article>; }) : <div className="empty-notifications"><IconBell size={28} /><p>{text.noNotifications}</p></div>}{notices.some((notice) => !notice.read) && <motion.button className="primary-action" whileTap={{ scale: .98 }} onClick={onMarkRead}>{text.markAllRead}</motion.button>}</div> : <form className="account-form" onSubmit={submit}>
        {kind === 'profile' && <><label>{text.fullName}<input autoComplete="name" value={profileDraft.name} maxLength={40} aria-invalid={!profileValidity.name} onChange={(event) => setProfileDraft({ ...profileDraft, name: event.target.value.replace(/[^\p{L}\s'’-]/gu, '').slice(0, 40) })} required /><small className={profileValidity.name ? '' : 'invalid'}>{text.nameRule}</small></label><label>{getCopy(locale).email}<input type="email" autoComplete="email" value={profileDraft.email} maxLength={80} aria-invalid={!profileValidity.email} onChange={(event) => setProfileDraft({ ...profileDraft, email: event.target.value.replace(/\s/g, '').slice(0, 80) })} required /><small className={profileValidity.email ? '' : 'invalid'}>{text.emailRule}</small></label><label>{text.phone}<input type="tel" inputMode="tel" autoComplete="tel" value={profileDraft.phone} maxLength={22} aria-invalid={!profileValidity.phone} onChange={(event) => setProfileDraft({ ...profileDraft, phone: event.target.value.replace(/[^\d+()\-\s]/g, '').slice(0, 22) })} required /><small className={profileValidity.phone ? '' : 'invalid'}>{text.phoneRule}</small></label></>}
        {kind === 'payment' && <><div className="mock-data-banner"><IconShieldCheck size={18} />{text.mockOnly}</div><label>{text.cardLabel}<input value={paymentDraft.label} onChange={(event) => setPaymentDraft({ ...paymentDraft, label: event.target.value })} required /></label><label>{text.lastFour}<input inputMode="numeric" value={paymentDraft.last4} maxLength={4} onChange={(event) => setPaymentDraft({ ...paymentDraft, last4: event.target.value.replace(/\D/g, '').slice(0, 4) })} required pattern="\d{4}" /></label></>}
        {kind === 'licence' && <><label>{text.licenceNumber}<input value={licenceDraft.number} onChange={(event) => setLicenceDraft({ ...licenceDraft, number: event.target.value })} required /></label><label>{text.expiry}<input value={licenceDraft.expiry} onChange={(event) => setLicenceDraft({ ...licenceDraft, expiry: event.target.value })} placeholder="08/2030" required /></label><label className="verification-toggle"><input type="checkbox" checked={licenceDraft.verified} onChange={(event) => setLicenceDraft({ ...licenceDraft, verified: event.target.checked })} /><span><IconCheck size={16} /></span>{text.verifiedStatus}</label></>}
        <motion.button className="primary-action" type="submit" whileTap={{ scale: .98 }} disabled={kind === 'profile' && !profileIsValid}>{text.saveChanges}</motion.button>
      </form>}
    </motion.section>
  </motion.div>;
}

function DetailHeader({ title, subtitle, backLabel, onClose }: { title: string; subtitle: string; backLabel: string; onClose: () => void }) {
  return <header className="trip-detail-header"><motion.button whileTap={{ scale: .9 }} onClick={onClose} aria-label={backLabel}><IconArrowLeft size={22} /></motion.button><div><span>{subtitle}</span><h2>{title}</h2></div><span className="header-spacer" /></header>;
}

function ReservationDetail({ reservation, car, payment, reduceMotion, onClose, onModify, onCancel, onAdvance, onExtend, locale }: { reservation: Reservation; car: Car; payment: PaymentData; reduceMotion: boolean; onClose: () => void; onModify: () => void; onCancel: () => void; onAdvance: () => void; onExtend: () => void; locale: Locale }) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const copy = getCopy(locale);
  const text = featureText[locale];
  const endDate = addDaysISO(reservation.startDate, reservation.days);
  const remainingDays = Math.max(0, daysBetweenISO(todayISO(), endDate));
  const canModify = reservation.status === 'confirmed' || reservation.status === 'ready';
  const lifecycleAction = reservation.status === 'confirmed' ? text.preparePickup : reservation.status === 'ready' ? text.startRental : reservation.status === 'active' ? text.completeRental : text.close;
  return <motion.section className="trip-overlay reservation-detail" initial={reduceMotion ? { opacity: 0 } : { x: '100%' }} animate={{ x: 0, opacity: 1 }} exit={reduceMotion ? { opacity: 0 } : { x: '100%' }} transition={spring} aria-labelledby="reservation-detail-title">
    <DetailHeader title={copy.reservation} subtitle={statusLabel(locale, reservation.status)} backLabel={copy.backTrips} onClose={onClose} />
    <div className="trip-overlay-content">
      <section className={`reservation-status lifecycle-status status-${reservation.status}`}><span className="completion-mark">{reservation.status === 'active' ? <IconCar size={22} /> : <IconCheck size={22} />}</span><div><p>{statusLabel(locale, reservation.status)}</p><h2 id="reservation-detail-title">{formatRentalDate(reservation.startDate, locale)} → {formatRentalDate(endDate, locale)}</h2><small>{dayCount(locale, reservation.days)} · {copy.confirmation} {reservation.confirmation}</small></div></section>
      {reservation.status === 'active' && <section className="active-rental-summary"><div><span>{dayCount(locale, remainingDays)}</span><small>{text.remaining}</small></div><div><span>{formatRentalDate(endDate, locale)}</span><small>{text.returnBy}</small></div></section>}
      <div className="reservation-car reservation-detail-car"><img draggable={false} src={car.image} alt="" /><div><span>{carTypeLabel(locale, car.type)}</span><strong>{car.name}</strong><small>{car.plate} · ₽{car.price.toLocaleString('ru-RU')}/{locale === 'ru' ? 'сутки' : 'day'}</small></div></div>
      <section className="detail-block"><h3>{reservation.status === 'active' ? text.returnLocation : copy.pickupInstructions}</h3><div className="pickup-instructions"><span className="row-icon blue"><IconMapPin size={18} /></span><div><strong>{copy.centralGroznyZone}</strong><p>{reservation.status === 'active' ? `${text.returnBy} ${formatRentalDate(endDate, locale)} · 10:00` : copy.arriveBeforePickup}</p><small><IconId size={15} /> {copy.bringLicence}</small></div></div></section>
      <section className="detail-block"><h3>{copy.mockReceipt}</h3><div className="receipt-list"><div><span>{copy.rental} · {dayCount(locale, reservation.days)}</span><b>₽{reservation.total.toLocaleString('ru-RU')}</b></div><div><span>{payment.label} ·· {payment.last4}</span><b>{copy.testPayment}</b></div><div><span>{copy.refundableDeposit}</span><b>₽0</b></div><div><span>{copy.total}</span><b>₽{reservation.total.toLocaleString('ru-RU')}</b></div></div><p className="mock-receipt-note"><IconShieldCheck size={16} /> {copy.developmentReceipt}</p></section>
      <p className="mock-lifecycle-note">{text.mockLifecycle}</p>
      <div className="reservation-actions"><motion.button className="lifecycle-action" whileTap={{ scale: .98 }} transition={spring} onClick={reservation.status === 'completed' ? onClose : onAdvance}>{lifecycleAction}</motion.button>{canModify && <motion.button className={`cancel-reservation ${confirmCancel ? 'confirming' : ''}`} whileTap={{ scale: .98 }} transition={spring} onClick={() => confirmCancel ? onCancel() : setConfirmCancel(true)}>{confirmCancel ? copy.tapAgainCancel : copy.cancelReservation}</motion.button>}</div>
    </div>
    {canModify && <motion.button className="modify-reservation reservation-floating-action" whileTap={{ scale: .98 }} transition={spring} onClick={onModify}>{copy.modifyReservation}</motion.button>}
    {reservation.status === 'active' && <motion.button className="modify-reservation reservation-floating-action" whileTap={{ scale: .98 }} transition={spring} onClick={onExtend}><IconPlus size={18} />{text.extendRental}</motion.button>}
  </motion.section>;
}

function TripDetail({ trip, reduceMotion, onClose, locale }: { trip: Trip; reduceMotion: boolean; onClose: () => void; locale: Locale }) {
  const copy = getCopy(locale);
  return <motion.section className="trip-overlay" initial={reduceMotion ? { opacity: 0 } : { x: '100%' }} animate={{ x: 0, opacity: 1 }} exit={reduceMotion ? { opacity: 0 } : { x: '100%' }} transition={spring} aria-labelledby="trip-detail-title">
    <DetailHeader title={copy.tripReceipt} subtitle={`${tripDate(locale, trip.date)} → ${tripDate(locale, trip.endDate)}`} backLabel={copy.backTrips} onClose={onClose} />
    <div className="trip-overlay-content">
      <section className="trip-total"><span className="completion-mark"><IconCheck size={22} /></span><p>{copy.completed}</p><strong>₽{trip.price.toLocaleString('ru-RU')}</strong><small>{trip.car} · {dayCount(locale, trip.days)}</small></section>
      <div className="trip-metrics"><div><IconClock size={20} /><span>{copy.duration}<strong>{dayCount(locale, trip.days)}</strong></span></div><div><IconRoute size={20} /><span>{copy.distance}<strong>{trip.distance} {locale === 'ru' ? 'км' : 'km'}</strong></span></div></div>
      <section className="detail-block"><h3>{copy.route}</h3><div className="route-timeline"><div><i /><span><small>{copy.start}</small><strong>{tripPlace(locale, trip.from)}</strong><p>{tripDate(locale, trip.date)} · {trip.time}</p></span></div><div><i /><span><small>{copy.finish}</small><strong>{tripPlace(locale, trip.to)}</strong><p>{tripDate(locale, trip.endDate)} · {trip.endTime}</p></span></div></div></section>
      <section className="detail-block"><h3>{copy.paymentDetails}</h3><div className="receipt-list"><div><span>{copy.drivingTime} · {dayCount(locale, trip.days)}</span><b>₽{trip.rentalFee.toLocaleString('ru-RU')}</b></div><div><span>{copy.parking}</span><b>₽{trip.extras.toLocaleString('ru-RU')}</b></div><div><span>{copy.total}</span><b>₽{trip.price.toLocaleString('ru-RU')}</b></div></div></section>
      <p className="trip-support"><IconShieldCheck size={17} /> {copy.tripSupport}</p>
    </div>
  </motion.section>;
}

function FinanceDetail({ totalSpend, totalDays, totalDistance, reduceMotion, onClose, onSelectTrip, locale }: { totalSpend: number; totalDays: number; totalDistance: number; reduceMotion: boolean; onClose: () => void; onSelectTrip: (trip: Trip) => void; locale: Locale }) {
  const budget = 40000;
  const rentalSpend = trips.reduce((sum, trip) => sum + trip.rentalFee, 0);
  const extrasSpend = trips.reduce((sum, trip) => sum + trip.extras, 0);
  const rentalShare = Math.round(rentalSpend / totalSpend * 100);
  const extrasShare = 100 - rentalShare;
  const copy = getCopy(locale);
  return <motion.section className="trip-overlay" initial={reduceMotion ? { opacity: 0 } : { x: '100%' }} animate={{ x: 0, opacity: 1 }} exit={reduceMotion ? { opacity: 0 } : { x: '100%' }} transition={spring} aria-labelledby="finance-title">
    <DetailHeader title={copy.tripActivity} subtitle={copy.augustOverview} backLabel={copy.backTrips} onClose={onClose} />
    <div className="trip-overlay-content finance-content">
      <section className="finance-hero"><span>{copy.spentMonth}</span><strong>₽{totalSpend.toLocaleString('ru-RU')}</strong><p>₽{Math.round(totalSpend / trips.length).toLocaleString('ru-RU')} {copy.averageTrip}</p><div className="budget-label"><span>{copy.monthlyBudget}</span><b>₽{totalSpend.toLocaleString('ru-RU')} {copy.of} ₽{budget.toLocaleString('ru-RU')}</b></div><div className="budget-track"><motion.i initial={{ width: 0 }} animate={{ width: `${Math.min(100, totalSpend / budget * 100)}%` }} transition={spring} /></div><small>₽{Math.max(0, budget - totalSpend).toLocaleString('ru-RU')} {copy.remaining}</small></section>
      <div className="finance-metrics"><div><IconRoute size={20} /><strong>{totalDistance.toFixed(0)} {locale === 'ru' ? 'км' : 'km'}</strong><span>{copy.totalDistance}</span></div><div><IconClock size={20} /><strong>{dayCount(locale, totalDays)}</strong><span>{copy.driveTime}</span></div><div><IconCreditCard size={20} /><strong>{trips.length}</strong><span>{copy.rentals}</span></div></div>
      <section className="detail-block"><h3>{copy.spendingBreakdown}</h3><div className="spend-breakdown"><div><span><i className="blue-dot" />{copy.driving}</span><b>₽{rentalSpend.toLocaleString('ru-RU')} <small>{rentalShare}%</small></b></div><div><span><i className="purple-dot" />{copy.parking}</span><b>₽{extrasSpend.toLocaleString('ru-RU')} <small>{extrasShare}%</small></b></div></div></section>
      <section className="detail-block"><h3>{copy.allTrips}</h3><div className="finance-trip-list">{trips.map((trip) => <button key={trip.id} onClick={() => onSelectTrip(trip)}><span><strong>{trip.car}</strong><small>{tripDate(locale, trip.date)} · {dayCount(locale, trip.days)}</small></span><b>₽{trip.price.toLocaleString('ru-RU')}<IconChevronRight size={16} /></b></button>)}</div></section>
    </div>
  </motion.section>;
}

function todayISO() {
  const value = new Date();
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}

function parseISODate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const value = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(value.getTime())) return null;
  return value.toISOString().slice(0, 10) === date ? value : null;
}

function isValidISODate(date: unknown): date is string {
  return typeof date === 'string' && parseISODate(date) !== null;
}

function isValidRentalDays(days: unknown): days is number {
  return typeof days === 'number' && Number.isInteger(days) && days >= 1 && days <= 30;
}

function addDaysISO(date: string, days: number) {
  const value = parseISODate(date);
  if (!value || !Number.isInteger(days) || days < 0 || days > 30) return '';
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function daysBetweenISO(start: string, end: string) {
  const from = parseISODate(start);
  const to = parseISODate(end);
  if (!from || !to) return 0;
  return Math.ceil((to.getTime() - from.getTime()) / 86400000);
}

function formatRentalDate(date: string, locale: Locale) {
  const value = parseISODate(date);
  if (!value) return getCopy(locale).chooseDate;
  return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(value);
}

function formatPickupDate(date: string, locale: Locale) {
  const value = parseISODate(date);
  if (!value) return getCopy(locale).chooseDate;
  return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(value);
}

function createReservation(car: Car, startDate: string, days: number, confirmation = `CR-${String(Date.now()).slice(-6)}`): Reservation {
  return { carId: car.id, startDate, days, total: car.price * days, confirmation, status: 'confirmed' };
}
