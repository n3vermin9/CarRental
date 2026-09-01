'use client';

import { type CSSProperties, type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, type PanInfo, useDragControls, useReducedMotion } from 'framer-motion';
import {
  IconAdjustmentsHorizontal, IconAlertTriangle, IconArrowLeft, IconBattery, IconBell, IconBolt, IconCar,
  IconCheck, IconChevronDown, IconChevronRight, IconClock, IconCreditCard, IconGauge, IconHeart, IconId,
  IconBulb, IconHome, IconLanguage, IconLock, IconLockOpen, IconLogout, IconMapPin, IconMessageCircle, IconMoon, IconNavigation, IconPhone, IconRoute, IconSearch, IconSun,
  IconShieldCheck, IconUser, IconUsers, IconX,
} from '@tabler/icons-react';
import { carTypeLabel, dayCount, getCopy, Locale, minuteCount, tripCount, tripDate, tripPlace } from './i18n';
import {
  addDaysISO, carBrandLogo, carBrandName, carSearchAliases, carSeats, cars, createReservation,
  defaultLicence, defaultPayment, defaultProfile, emptyFleetFilters, filters, formatPickupDate,
  formatPickupTime, formatRentalDate, isBookingStatus, isValidISODate, isValidPickupTime,
  isValidRentalDays, normalizeSearch, parseAppPath, parseISODate, daysBetweenISO, pickupWaitDailyFee,
  reservationPriceBreakdown, reservationStorageVersion, sanitizeProfile, tabPath, todayISO, trips,
  type AccountSheetKind, type AppNotice, type BookingStatus, type Car, type FleetFilters,
  type LicenceData, type NoticeKind, type PaymentData, type ProfileData, type Reservation,
  type TabId, type Theme, type Trip,
} from './carshare-domain';
import { AppLoading, CarImage, OfflineBanner, StatusToast } from './components/app-system';
import {
  DamageReportSheet, NotificationPermissionRow, PickupNavigationButton,
  RatingControl, ReceiptDownloadButton, SupportSheet,
} from './components/product-tools';

const featureText = {
  en: {
    filters: 'Filters', reset: 'Reset', apply: 'Show cars', pickupDate: 'Pickup date', anyDate: 'Any date', maxDailyPrice: 'Maximum daily price', anyPrice: 'Any price', brand: 'Brand', anyBrand: 'Any brand', carClass: 'Car class', seats: 'Seats', anySeats: 'Any', filterResults: 'matching cars',
    ready: 'Ready for pickup', active: 'Active rental', activeNow: 'Active now', completedRental: 'Rental completed', confirmedStatus: 'Confirmed', preparePickup: "I'm ready to pick up", startRental: 'Start rental', completeRental: 'End rental', extendRental: 'Extend by one day', remaining: 'remaining', returnBy: 'Return by', pickupLocation: 'Pickup location', returnLocation: 'Return location', vehicleControls: 'Vehicle controls', lockCar: 'Lock', unlockCar: 'Unlock', lights: 'Lights', support: 'Support', routeBack: 'Return route', mockLifecycle: 'Development controls simulate the rental lifecycle.',
    notifications: 'Notifications', noNotifications: 'No notifications yet', pickupNotice: 'Pickup reminder', pickupNoticeBody: 'Your car is scheduled for pickup in Central Grozny.', returnNotice: 'Return reminder', returnNoticeBody: 'Your active rental is approaching its return date.', extensionNotice: 'Rental extended', extensionNoticeBody: 'One day was added and the mock total was updated.', markAllRead: 'Mark all read', allRead: 'All read',
    editProfile: 'Edit profile', profileDetails: 'Profile details', fullName: 'Full name', phone: 'Phone', saveChanges: 'Save changes', nameRule: 'Use 2–40 letters.', emailRule: 'Enter a valid email address.', phoneRule: 'Enter 10–15 digits.', editPayment: 'Edit payment method', cardLabel: 'Card label', lastFour: 'Mock last four digits', mockOnly: 'Mock data only. Do not enter real card information.', editLicence: 'Driving licence', licenceNumber: 'Licence number', expiry: 'Expiry', verifiedStatus: 'Verified document', close: 'Close',
  },
  ru: {
    filters: 'Фильтры', reset: 'Сбросить', apply: 'Показать авто', pickupDate: 'Дата получения', anyDate: 'Любая дата', maxDailyPrice: 'Цена за сутки до', anyPrice: 'Любая цена', brand: 'Марка', anyBrand: 'Любая марка', carClass: 'Класс автомобиля', seats: 'Места', anySeats: 'Любое', filterResults: 'подходящих авто',
    ready: 'Готов к получению', active: 'Активная аренда', activeNow: 'Аренда активна', completedRental: 'Аренда завершена', confirmedStatus: 'Подтверждено', preparePickup: 'Я готов забрать авто', startRental: 'Начать аренду', completeRental: 'Завершить аренду', extendRental: 'Продлить на один день', remaining: 'осталось', returnBy: 'Вернуть до', pickupLocation: 'Место получения', returnLocation: 'Место возврата', vehicleControls: 'Управление автомобилем', lockCar: 'Закрыть', unlockCar: 'Открыть', lights: 'Фары', support: 'Помощь', routeBack: 'Маршрут возврата', mockLifecycle: 'Элементы разработки имитируют этапы аренды.',
    notifications: 'Уведомления', noNotifications: 'Уведомлений пока нет', pickupNotice: 'Напоминание о получении', pickupNoticeBody: 'Автомобиль ожидает получения в центре Грозного.', returnNotice: 'Напоминание о возврате', returnNoticeBody: 'Срок активной аренды приближается к завершению.', extensionNotice: 'Аренда продлена', extensionNoticeBody: 'Добавлен один день, тестовая сумма обновлена.', markAllRead: 'Прочитать все', allRead: 'Всё прочитано',
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
const tabSpring = { type: 'spring' as const, stiffness: 470, damping: 42, mass: .76 };
const swipeBackThreshold = 84;
const sheetDismissThreshold = 92;
let lastHapticAt = 0;

type HapticKind = 'selection' | 'impact' | 'success';

function triggerHaptic(kind: HapticKind = 'selection') {
  if (typeof window === 'undefined') return;
  const now = performance.now();
  if (now - lastHapticAt < 38) return;
  lastHapticAt = now;
  try {
    const bridge = (window as Window & { webkit?: { messageHandlers?: { haptic?: { postMessage: (value: HapticKind) => void } } } }).webkit?.messageHandlers?.haptic;
    if (bridge) bridge.postMessage(kind);
    else navigator.vibrate?.(kind === 'success' ? [10, 32, 16] : kind === 'impact' ? 14 : 7);
  } catch { /* Haptics are an optional enhancement. */ }
}

function useHorizontalGestureLock<T extends HTMLElement>() {
  const cleanupRef = useRef<(() => void) | null>(null);
  const ref = useCallback((node: T | null) => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    if (!node) return;

    let startX = 0;
    let startY = 0;
    let axis: 'x' | 'y' | null = null;
    const reset = () => { axis = null; };
    const handleTouchStart = (event: globalThis.TouchEvent) => {
      if (event.touches.length !== 1) return reset();
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
      axis = null;
    };
    const handleTouchMove = (event: globalThis.TouchEvent) => {
      if (event.touches.length !== 1) return;
      const deltaX = Math.abs(event.touches[0].clientX - startX);
      const deltaY = Math.abs(event.touches[0].clientY - startY);
      if (!axis && Math.max(deltaX, deltaY) >= 5) axis = deltaX > deltaY * 1.08 ? 'x' : 'y';
      if (axis === 'x' && event.cancelable) event.preventDefault();
    };
    node.addEventListener('touchstart', handleTouchStart, { passive: true, capture: true });
    node.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
    node.addEventListener('touchend', reset, { passive: true, capture: true });
    node.addEventListener('touchcancel', reset, { passive: true, capture: true });
    cleanupRef.current = () => {
      node.removeEventListener('touchstart', handleTouchStart, true);
      node.removeEventListener('touchmove', handleTouchMove, true);
      node.removeEventListener('touchend', reset, true);
      node.removeEventListener('touchcancel', reset, true);
    };
  }, []);
  useEffect(() => () => cleanupRef.current?.(), []);
  return ref;
}

function shouldSwipeBack(info: PanInfo) {
  return info.offset.x > swipeBackThreshold || info.velocity.x > 720;
}

function shouldDismissSheet(info: PanInfo) {
  return info.offset.y > sheetDismissThreshold || info.velocity.y > 760;
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

export default function CarShareApp({ initialTab = 'explore', initialCarId = null, initialReservation = false }: { initialTab?: TabId; initialCarId?: number | null; initialReservation?: boolean }) {
  const reduceMotion = useReducedMotion();
  const tabDragControls = useDragControls();
  const [locale, setLocale] = useState<Locale>('ru');
  const [theme, setTheme] = useState<Theme>('dark');
  const [hydrated, setHydrated] = useState(false);
  const [online, setOnline] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const toastTimer = useRef<number | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [email, setEmail] = useState('developer@carshare.local');
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [tabDirection, setTabDirection] = useState(0);
  const [desktopLayout, setDesktopLayout] = useState(false);
  const [navigationDismissRequest, setNavigationDismissRequest] = useState(0);
  const [detailCarId, setDetailCarId] = useState<number | null>(initialCarId);
  const [gestureNavDelay, setGestureNavDelay] = useState(false);
  const gestureNavTimer = useRef<number | null>(null);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [checkoutCarId, setCheckoutCarId] = useState<number | null>(null);
  const [reservationEditTransition, setReservationEditTransition] = useState(false);
  const reservationEditTimer = useRef<number | null>(null);
  const [fleetFilters, setFleetFilters] = useState<FleetFilters>(emptyFleetFilters);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [notices, setNotices] = useState<AppNotice[]>([]);
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [payment, setPayment] = useState<PaymentData>(defaultPayment);
  const [licence, setLicence] = useState<LicenceData>(defaultLicence);
  const [secondaryOverlayOpen, setSecondaryOverlayOpen] = useState(false);
  const [reservationDetailsRequested, setReservationDetailsRequested] = useState(initialReservation);
  const [exploreScrolled, setExploreScrolled] = useState(false);
  const [savedIds, setSavedIds] = useState<number[]>([1, 2]);
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const tabSwipeRef = useHorizontalGestureLock<HTMLDivElement>();
  const carDetailSwipeRef = useHorizontalGestureLock<HTMLElement>();
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
        const storedSavedIds = JSON.parse(localStorage.getItem('carshare-saved') || '[1,2]') as number[];
        if (Array.isArray(storedSavedIds)) setSavedIds(storedSavedIds.filter((id) => cars.some((car) => car.id === id)));
        const storedRatings = JSON.parse(localStorage.getItem('carshare-ratings') || '{}') as Record<number, number>;
        if (storedRatings && typeof storedRatings === 'object') setRatings(storedRatings);
      } catch { /* Keep safe development defaults. */ }
      const shouldClearInitialRental = localStorage.getItem('carshare-reservation-storage-version') !== reservationStorageVersion;
      if (shouldClearInitialRental) {
        localStorage.removeItem('carshare-reservation');
        localStorage.removeItem('carshare-reserved-id');
        localStorage.setItem('carshare-reservation-storage-version', reservationStorageVersion);
      }
      const storedReservation = shouldClearInitialRental ? null : localStorage.getItem('carshare-reservation');
      if (storedReservation) {
        try {
          const parsed = JSON.parse(storedReservation) as Reservation;
          const reservationCar = cars.find((car) => car.id === parsed.carId);
          if (reservationCar && isValidISODate(parsed.startDate) && isValidRentalDays(parsed.days)) {
            const bookedOn = isValidISODate(parsed.bookedOn) && parsed.bookedOn <= parsed.startDate ? parsed.bookedOn : todayISO();
            const calculatedTotal = reservationPriceBreakdown(reservationCar, parsed.startDate, parsed.days, bookedOn).total;
            const normalized = { ...parsed, bookedOn, pickupTime: isValidPickupTime(parsed.pickupTime) ? `${parsed.pickupTime.slice(0, 2)}:00` : '10:00', total: Number.isFinite(parsed.total) && parsed.total >= calculatedTotal ? parsed.total : calculatedTotal, status: isBookingStatus(parsed.status) ? parsed.status : parsed.startDate <= todayISO() ? 'ready' : 'confirmed' };
            setReservation(normalized);
            localStorage.setItem('carshare-reservation', JSON.stringify(normalized));
          }
          else localStorage.removeItem('carshare-reservation');
        } catch { localStorage.removeItem('carshare-reservation'); }
      } else localStorage.removeItem('carshare-reserved-id');
      setHydrated(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  useEffect(() => {
    const syncOnlineStatus = () => setOnline(navigator.onLine);
    const frame = requestAnimationFrame(syncOnlineStatus);
    window.addEventListener('online', syncOnlineStatus);
    window.addEventListener('offline', syncOnlineStatus);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('online', syncOnlineStatus);
      window.removeEventListener('offline', syncOnlineStatus);
    };
  }, []);
  useEffect(() => {
    const syncRoute = () => {
      const route = parseAppPath(window.location.pathname);
      setActiveTab(route.tab);
      setDetailCarId(route.carId);
      setReservationDetailsRequested(route.reservation);
      setCheckoutCarId(null);
      setShowFilterSheet(false);
      setShowNotifications(false);
      setShowSupport(false);
      setSecondaryOverlayOpen(route.reservation);
    };
    window.addEventListener('popstate', syncRoute);
    return () => window.removeEventListener('popstate', syncRoute);
  }, []);
  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 1024px)');
    const updateDesktopLayout = () => setDesktopLayout(desktopQuery.matches);
    updateDesktopLayout();
    desktopQuery.addEventListener('change', updateDesktopLayout);
    return () => desktopQuery.removeEventListener('change', updateDesktopLayout);
  }, []);
  useEffect(() => () => {
    if (gestureNavTimer.current !== null) window.clearTimeout(gestureNavTimer.current);
    if (reservationEditTimer.current !== null) window.clearTimeout(reservationEditTimer.current);
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
  }, []);
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
  const reservationCar = cars.find((car) => car.id === reservation?.carId) ?? null;
  const checkoutCar = cars.find((car) => car.id === checkoutCarId) ?? null;
  const detailReservationIsOpen = Boolean(detailCar && reservation?.carId === detailCar.id && reservation.status !== 'completed');
  const activeFilterCount = [fleetFilters.maxPrice, fleetFilters.brand !== 'All', fleetFilters.carClass !== 'All'].filter(Boolean).length;
  const navCovered = Boolean(detailCar || checkoutCar || showFilterSheet || showNotifications || showSupport || secondaryOverlayOpen || gestureNavDelay || reservationEditTransition);
  const navUnavailable = navCovered && !desktopLayout;

  function navigatePath(path: string, replace = false) {
    if (window.location.pathname === path) return;
    window.history[replace ? 'replaceState' : 'pushState']({}, '', path);
  }

  function showToast(message: string) {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToastMessage(message);
    toastTimer.current = window.setTimeout(() => setToastMessage(''), 2600);
  }

  function openCarDetails(id: number) {
    setDetailCarId(id);
    navigatePath(`/cars/${id}`);
  }

  function closeCarDetails() {
    setDetailCarId(null);
    navigatePath(tabPath(activeTab), true);
  }

  function closeDetailFromGesture() {
    if (gestureNavTimer.current !== null) window.clearTimeout(gestureNavTimer.current);
    setGestureNavDelay(!reduceMotion);
    closeCarDetails();
    gestureNavTimer.current = window.setTimeout(() => setGestureNavDelay(false), reduceMotion ? 0 : 360);
  }

  function signIn() {
    setSignedIn(true);
    try { localStorage.setItem('carshare-dev-session', 'active'); } catch { /* Session storage is optional in restricted web views. */ }
    showToast(locale === 'ru' ? 'Добро пожаловать' : 'Welcome back');
  }
  function signOut() {
    setSignedIn(false);
    try { localStorage.removeItem('carshare-dev-session'); } catch { /* Session storage is optional in restricted web views. */ }
  }
  function changeLocale(next: Locale) { localStorage.setItem('carshare-language', next); setLocale(next); }
  function changeTheme(next: Theme) { localStorage.setItem('carshare-theme', next); setTheme(next); }
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
    const nextStatus: BookingStatus = reservation.status === 'confirmed' || reservation.status === 'ready' ? 'active' : 'completed';
    saveReservation({ ...reservation, status: nextStatus });
    triggerHaptic('success');
    if (nextStatus === 'active') addNotice('return');
    showToast(nextStatus === 'active' ? (locale === 'ru' ? 'Аренда началась' : 'Rental started') : (locale === 'ru' ? 'Аренда завершена' : 'Rental completed'));
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
  function dismissSurfacesForNavigation() {
    if (gestureNavTimer.current !== null) {
      window.clearTimeout(gestureNavTimer.current);
      gestureNavTimer.current = null;
    }
    if (reservationEditTimer.current !== null) {
      window.clearTimeout(reservationEditTimer.current);
      reservationEditTimer.current = null;
    }
    setCheckoutCarId(null);
    setDetailCarId(null);
    setShowFilterSheet(false);
    setShowNotifications(false);
    setShowSupport(false);
    setReservationDetailsRequested(false);
    setSecondaryOverlayOpen(false);
    setGestureNavDelay(false);
    setReservationEditTransition(false);
    setNavigationDismissRequest((request) => request + 1);
  }
  function switchTab(next: TabId) {
    const isChangingTab = next !== activeTab;
    if (!isChangingTab && !navCovered) return;
    triggerHaptic('selection');
    dismissSurfacesForNavigation();
    navigatePath(tabPath(next));
    if (!isChangingTab) return;
    setTabDirection(tabs.findIndex((tab) => tab.id === next) - tabs.findIndex((tab) => tab.id === activeTab));
    setActiveTab(next);
  }
  function switchTabFromSwipe(info: PanInfo) {
    if (navCovered) return;
    const horizontalIntent = Math.abs(info.offset.x) >= 62 || Math.abs(info.velocity.x) >= 620;
    if (!horizontalIntent) return;
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    const swipeDirection = Math.abs(info.offset.x) >= 62 ? Math.sign(info.offset.x) : Math.sign(info.velocity.x);
    const nextIndex = Math.max(0, Math.min(tabs.length - 1, currentIndex + (swipeDirection < 0 ? 1 : -1)));
    if (nextIndex !== currentIndex) switchTab(tabs[nextIndex].id);
  }
  function openReservationDetails() {
    setReservationDetailsRequested(true);
    setSecondaryOverlayOpen(true);
    navigatePath('/reservation');
  }
  function openReservationEditor(id: number) {
    if (reservationEditTimer.current !== null) window.clearTimeout(reservationEditTimer.current);
    setReservationEditTransition(true);
    reservationEditTimer.current = window.setTimeout(() => {
      setCheckoutCarId(id);
      setReservationEditTransition(false);
      reservationEditTimer.current = null;
    }, reduceMotion ? 0 : 260);
  }
  function openSavedCar(id: number) { openCarDetails(id); }
  function toggleSaved(id: number) {
    setSavedIds((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      localStorage.setItem('carshare-saved', JSON.stringify(next));
      return next;
    });
  }
  function saveRating(tripId: number, value: number) {
    setRatings((current) => {
      const next = { ...current, [tripId]: value };
      localStorage.setItem('carshare-ratings', JSON.stringify(next));
      return next;
    });
    showToast(locale === 'ru' ? 'Спасибо за оценку' : 'Thanks for your rating');
  }
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
  function confirmReservation(car: Car, startDate: string, pickupTime: string, days: number, promoCode: string) {
    if (!isValidISODate(startDate) || startDate < todayISO() || !isValidRentalDays(days)) return;
    if (!isValidPickupTime(pickupTime)) return;
    const editingCurrentReservation = reservation?.carId === car.id && reservation.status !== 'completed';
    const next = createReservation(car, startDate, pickupTime, days, editingCurrentReservation ? reservation.confirmation : undefined, editingCurrentReservation ? reservation.bookedOn : undefined, promoCode);
    saveReservation(next); triggerHaptic('success'); setCheckoutCarId(null); showToast(locale === 'ru' ? 'Бронирование подтверждено' : 'Reservation confirmed');
  }
  function cancelReservation() { localStorage.removeItem('carshare-reservation'); localStorage.removeItem('carshare-reserved-id'); setReservation(null); }

  if (!hydrated) return <AppLoading label={locale === 'ru' ? 'Загрузка CarShare' : 'Loading CarShare'} />;

  if (!signedIn) return (
    <main className="apple-login">
      {!online && <OfflineBanner locale={locale} />}
      <motion.section className="apple-login-card" initial={false} animate={{ opacity: 1, y: 0, scale: 1 }} transition={spring} aria-labelledby="login-title">
        <div className="login-symbol"><img draggable={false} src="/valoar-logo.svg" alt="" /></div>
        <div className="login-copy"><h1 id="login-title">{copy.welcome}</h1><p>{copy.welcomeDescription}</p></div>
        <form autoComplete="off" onSubmit={(event) => { event.preventDefault(); signIn(); }}>
          <label htmlFor="dev-email">{copy.email}</label><input id="dev-email" type="text" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} />
          <label htmlFor="dev-access-code">{copy.password}</label><input id="dev-access-code" className="masked-login-input" type="text" defaultValue="carshare" required autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} />
        <motion.button type="button" onClick={signIn} whileTap={{ scale: .98 }} transition={spring}>{copy.continue}</motion.button>
        </form>
        <p className="privacy-note"><IconShieldCheck size={16} /> {copy.privacy}</p>
      </motion.section>
    </main>
  );

  return (
    <main className="app-shell apple-app" onPointerDownCapture={(event) => { if ((event.target as HTMLElement).closest('button, input[type="range"]')) triggerHaptic('selection'); }}>
      {!online && <OfflineBanner locale={locale} />}
      <AnimatePresence>{toastMessage && <StatusToast message={toastMessage} />}</AnimatePresence>
      <AnimatePresence mode="wait" initial={false} custom={tabDirection}>
        <motion.div ref={tabSwipeRef} className="tab-stage swipe-enabled" key={activeTab} custom={tabDirection}
          initial={tabDirection === 0 ? false : reduceMotion ? { opacity: 0 } : { x: tabDirection > 0 ? 42 : -42, opacity: 0 }}
          animate={reduceMotion ? { opacity: 1 } : { x: 0, opacity: 1, transition: tabSpring }}
          exit={reduceMotion ? { opacity: 0, transition: { duration: .01 } } : { x: tabDirection > 0 ? -18 : 18, opacity: 0, transition: { duration: .08, ease: 'easeOut' } }}
          drag={reduceMotion || navCovered ? false : 'x'} dragControls={tabDragControls} dragListener={false} dragConstraints={{ left: 0, right: 0 }} dragElastic={{ left: .14, right: .14 }} dragDirectionLock
          onPointerDown={(event) => { if (!reduceMotion && !navCovered && !(event.target as HTMLElement).closest('input, textarea, select, .apple-filters, .filter-chip-rail, .ios-wheel-column')) tabDragControls.start(event.nativeEvent); }}
          onDragEnd={(_, info) => switchTabFromSwipe(info)}>
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
                    {visibleCars.map((car, index) => <motion.article className="vehicle-card" key={car.id} role="button" tabIndex={0} onClick={() => openCarDetails(car.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') openCarDetails(car.id); }} aria-label={`${copy.openDetails} ${car.name}`} initial={false} whileTap={{ scale: .985 }}>
                      <div className="vehicle-photo"><CarImage src={car.image} alt={car.name} priority={index < 4} /><span className="brand-badge" aria-hidden="true"><img draggable={false} width={22} height={22} loading="lazy" decoding="async" src={carBrandLogo(car.name)} alt="" /></span></div>
                      <div className="vehicle-copy"><div className="vehicle-topline"><span>{car.electric && <IconBolt size={12} fill="currentColor" />}{carTypeLabel(locale, car.type)}</span><button className={savedIds.includes(car.id) ? 'saved' : ''} onClick={(event) => { event.stopPropagation(); toggleSaved(car.id); }} aria-label={`${savedIds.includes(car.id) ? copy.remove : copy.save} ${car.name}`}><IconHeart size={19} fill={savedIds.includes(car.id) ? 'currentColor' : 'none'} /></button></div><h3>{car.name}</h3><p>{car.plate}</p><div className="vehicle-footer"><strong>₽{car.price.toLocaleString('ru-RU')}</strong></div></div>
                    </motion.article>)}
                    {!visibleCars.length && <div className="empty-state"><IconSearch size={28} /><h3>{copy.noCars}</h3><p>{copy.tryAnother}</p></div>}
                  </motion.div>
                </AnimatePresence>
              </div>
            </section>
          ) : <SecondaryPage key={`${activeTab}-${navigationDismissRequest}`} activeTab={activeTab} savedIds={savedIds} signOut={signOut} openSavedCar={openSavedCar} toggleSaved={toggleSaved} reservation={reservation} reservationCar={reservationCar} modifyReservation={openReservationEditor} advanceReservation={advanceReservation} onOverlayVisibilityChange={setSecondaryOverlayOpen} locale={locale} changeLocale={changeLocale} theme={theme} changeTheme={changeTheme} notices={notices} markNoticesRead={markNoticesRead} profile={profile} payment={payment} licence={licence} saveProfile={saveProfile} savePayment={savePayment} saveLicence={saveLicence} ratings={ratings} saveRating={saveRating} openSupport={() => setShowSupport(true)} showToast={showToast} />}
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>{detailCar && <motion.section ref={carDetailSwipeRef} className="car-detail apple-detail horizontal-swipe-surface" aria-labelledby="car-detail-title" initial={reduceMotion ? { opacity: 0 } : { x: '100%' }} animate={{ x: 0, opacity: 1 }} exit={reduceMotion ? { opacity: 0 } : { x: '100%' }} transition={spring} drag={reduceMotion ? false : 'x'} dragConstraints={{ left: 0, right: 0 }} dragElastic={{ left: 0, right: .2 }} dragDirectionLock onDragEnd={(_, info) => { if (shouldSwipeBack(info)) closeDetailFromGesture(); }}>
        <div className="car-detail-scroll">
          <div className="detail-hero"><CarImage src={detailCar.image} alt={detailCar.name} priority sizes="(max-width: 1023px) 100vw, 45vw" /><div className="detail-scrim" /><motion.button className="detail-glass-button detail-back" whileTap={{ scale: .9 }} onClick={closeCarDetails} aria-label={copy.backPrevious}><IconArrowLeft size={23} /></motion.button><motion.button className={`detail-glass-button detail-save ${savedIds.includes(detailCar.id) ? 'saved' : ''}`} whileTap={{ scale: .9 }} onClick={() => toggleSaved(detailCar.id)} aria-label={`${copy.save} ${detailCar.name}`}><IconHeart size={21} fill={savedIds.includes(detailCar.id) ? 'currentColor' : 'none'} /></motion.button><div className="detail-hero-copy"><span>{detailCar.electric && <IconBolt size={12} fill="currentColor" />}{carTypeLabel(locale, detailCar.type)}</span><h1 id="car-detail-title">{detailCar.name}</h1><p><IconMapPin size={14} /> {minuteCount(locale, detailCar.walk, true)} · {copy.centralGrozny}</p></div></div>
          <div className="detail-content"><div className="detail-price"><div><span>{copy.dailyRental}</span><strong>₽{detailCar.price.toLocaleString('ru-RU')}<small>/{locale === 'ru' ? 'сутки' : 'day'}</small></strong></div><span className="detail-available"><i />{copy.availableNow}</span></div><div className="detail-metrics"><div><IconGauge size={21} /><span>{copy.range}<strong>{detailCar.range} {locale === 'ru' ? 'км' : 'km'}</strong></span></div><div><IconBattery size={21} /><span>{detailCar.electric ? copy.charge : copy.fuel}<strong>{detailCar.electric ? '82%' : '74%'}</strong></span></div><div><IconUsers size={21} /><span>{copy.seats}<strong>{carSeats(detailCar.name)} {copy.people}</strong></span></div></div><section className="detail-section"><h2>{copy.readyCity}</h2><p>{copy.readyCityDescription}</p></section><section className="detail-section"><h2>{copy.included}</h2><div className="feature-list"><span><IconShieldCheck size={19} />{copy.comprehensiveInsurance}</span><span><IconCar size={19} />{copy.fuelParking}</span><span><IconRoute size={19} />{copy.roadsideSupport}</span></div></section><section className="detail-section detail-location"><h2>{copy.pickup}</h2><div><IconMapPin size={20} /><span><strong>{copy.centralGrozny}</strong><small>{detailCar.walk} {copy.exactAfterReservation}</small></span></div><PickupNavigationButton locale={locale} /></section></div>
        </div>
        <div className="detail-action"><motion.button className={`detail-reserve ${detailReservationIsOpen ? 'reserved' : ''}`} whileTap={{ scale: .98 }} transition={spring} onClick={() => detailReservationIsOpen ? openReservationDetails() : setCheckoutCarId(detailCar.id)} aria-haspopup="dialog">{detailReservationIsOpen ? copy.viewReservationDetails : copy.reserveCar}</motion.button></div>
      </motion.section>}</AnimatePresence>
      <AnimatePresence>
        {reservationDetailsRequested && reservation && reservationCar && <ReservationDetail reservation={reservation} car={reservationCar} payment={payment} reduceMotion={!!reduceMotion} backLabel={copy.backPrevious} onClose={() => { setReservationDetailsRequested(false); setSecondaryOverlayOpen(false); navigatePath('/trips', true); }} onModify={() => { setReservationDetailsRequested(false); setSecondaryOverlayOpen(false); openReservationEditor(reservationCar.id); }} onAdvance={advanceReservation} locale={locale} />}
      </AnimatePresence>
      <nav className={`apple-tabbar ${navCovered ? 'covered' : ''}`} aria-label={copy.mainNavigation} aria-hidden={navUnavailable}>
        <div className="desktop-nav-brand" aria-hidden="true"><span><img draggable={false} src="/valoar-logo.svg" alt="" /></span><strong>CarShare</strong></div>
        <div className="desktop-nav-label" aria-hidden="true">{copy.mainNavigation}</div>
        {tabs.map((tab) => { const Icon = tab.icon; const isActive = activeTab === tab.id; return <motion.button key={tab.id} onClick={() => switchTab(tab.id)} className={isActive ? 'active' : ''} aria-current={isActive ? 'page' : undefined} tabIndex={navUnavailable ? -1 : 0} whileTap={{ scale: .92 }} transition={spring}>{isActive && <motion.span className="tab-selection" layoutId="tab-selection" transition={spring} />}<span className="tab-icon"><Icon size={22} stroke={isActive ? 2 : 1.7} fill={isActive && tab.id === 'saved' ? 'currentColor' : 'none'} /></span><small>{copy[tab.id]}</small></motion.button>; })}
      </nav>
      <AnimatePresence>
        {checkoutCar && <ReservationCheckout key={`checkout-${checkoutCar.id}-${reservation?.confirmation ?? 'new'}`} car={checkoutCar} existingReservation={reservation?.carId === checkoutCar.id && reservation.status !== 'completed' ? reservation : null} payment={payment} reduceMotion={!!reduceMotion} onClose={() => setCheckoutCarId(null)} onCancel={() => { cancelReservation(); setCheckoutCarId(null); }} onConfirm={(startDate, pickupTime, days, promoCode) => confirmReservation(checkoutCar, startDate, pickupTime, days, promoCode)} locale={locale} />}
        {showFilterSheet && <FleetFilterSheet current={fleetFilters} resultCount={visibleCars.length} locale={locale} reduceMotion={!!reduceMotion} onClose={() => setShowFilterSheet(false)} onApply={saveFleetFilters} onReset={resetFleetFilters} />}
        {showNotifications && <AccountSheet kind="notifications" locale={locale} reduceMotion={!!reduceMotion} profile={profile} payment={payment} licence={licence} notices={notices} onClose={() => setShowNotifications(false)} onSaveProfile={saveProfile} onSavePayment={savePayment} onSaveLicence={saveLicence} onMarkRead={markNoticesRead} />}
        {showSupport && <SupportSheet locale={locale} onClose={() => setShowSupport(false)} />}
      </AnimatePresence>
    </main>
  );
}

function FleetFilterSheet({ current, locale, reduceMotion, onClose, onApply, onReset }: { current: FleetFilters; resultCount: number; locale: Locale; reduceMotion: boolean; onClose: () => void; onApply: (filters: FleetFilters) => void; onReset: () => void }) {
  const sheetDragControls = useDragControls();
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
    <motion.section className="feature-sheet filter-sheet" role="dialog" aria-modal="true" aria-labelledby="filter-sheet-title" initial={reduceMotion ? { opacity: 0 } : { y: 42, scale: .985, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={reduceMotion ? { opacity: 0 } : { y: 24, opacity: 0 }} transition={reduceMotion ? { duration: .01 } : sheetSpring} drag={reduceMotion ? false : 'y'} dragControls={sheetDragControls} dragListener={false} dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: .2 }} onDragEnd={(_, info) => { if (shouldDismissSheet(info)) onClose(); }} onClick={(event) => event.stopPropagation()}>
      <div className="sheet-grabber-zone" aria-hidden="true" onPointerDown={(event) => sheetDragControls.start(event.nativeEvent)}><span /></div>
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
      <div className="feature-sheet-actions"><motion.button className="primary-action" whileTap={{ scale: .98 }} transition={spring} onClick={() => onApply(draft)}>{text.apply}</motion.button></div>
    </motion.section>
  </motion.div>;
}

type WheelOption = { value: string; label: string; disabled?: boolean };

function WheelColumn({ options, value, label, className = '', onChange }: { options: WheelOption[]; value: string; label: string; className?: string; onChange: (value: string) => void }) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const settleTimer = useRef<number | null>(null);
  const interacting = useRef(false);
  const valueRef = useRef(value);
  useEffect(() => { valueRef.current = value; }, [value]);
  useEffect(() => {
    const index = Math.max(0, options.findIndex((option) => option.value === value));
    const wheel = wheelRef.current;
    if (!wheel || interacting.current || Math.abs(wheel.scrollTop - index * 36) < 2) return;
    wheel.scrollTo({ top: index * 36, behavior: 'auto' });
  }, [options, value]);
  useEffect(() => () => { if (settleTimer.current !== null) window.clearTimeout(settleTimer.current); }, []);
  function settleSelection() {
    const wheel = wheelRef.current;
    if (!wheel) return;
    let index = Math.max(0, Math.min(options.length - 1, Math.round(wheel.scrollTop / 36)));
    if (options[index].disabled) index = Math.max(0, options.findIndex((option, optionIndex) => optionIndex >= index && !option.disabled));
    const next = options[index];
    wheel.scrollTo({ top: index * 36, behavior: 'smooth' });
    if (next && next.value !== valueRef.current) {
      valueRef.current = next.value;
      triggerHaptic('selection');
      onChange(next.value);
    }
  }
  function scheduleSettle(delay = 120) {
    if (settleTimer.current !== null) window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(settleSelection, delay);
  }
  return <div className={`ios-wheel-column ${className}`} role="listbox" aria-label={label} ref={wheelRef} onScroll={() => scheduleSettle(140)} onTouchStart={() => { interacting.current = true; if (settleTimer.current !== null) window.clearTimeout(settleTimer.current); }} onTouchEnd={() => { interacting.current = false; scheduleSettle(150); }} onPointerDown={() => { interacting.current = true; }} onPointerUp={() => { interacting.current = false; scheduleSettle(100); }} onPointerCancel={() => { interacting.current = false; scheduleSettle(100); }}>
    {options.map((option, index) => <button type="button" role="option" aria-selected={option.value === value} disabled={option.disabled} key={option.value} onClick={() => { wheelRef.current?.scrollTo({ top: index * 36, behavior: 'smooth' }); scheduleSettle(180); }}>{option.label}</button>)}
  </div>;
}

function ReservationCheckout({ car, existingReservation, payment, reduceMotion, onClose, onCancel, onConfirm, locale }: { car: Car; existingReservation: Reservation | null; payment: PaymentData; reduceMotion: boolean; onClose: () => void; onCancel: () => void; onConfirm: (startDate: string, pickupTime: string, days: number, promoCode: string) => void; locale: Locale }) {
  const sheetDragControls = useDragControls();
  const pickupDates = useMemo(() => Array.from({ length: 30 }, (_, index) => addDaysISO(todayISO(), index)).filter(Boolean), []);
  const dateOptions = useMemo(() => {
    const today = todayISO();
    const baseDate = parseISODate(today);
    if (!baseDate) return [];
    return Array.from({ length: 32 }, (_, index) => {
      const date = new Date(baseDate);
      date.setUTCDate(date.getUTCDate() + index - 2);
      const value = date.toISOString().slice(0, 10);
      return { value, label: value === today ? (locale === 'ru' ? 'Сегодня' : 'Today') : formatPickupDate(value, locale), disabled: value < today };
    });
  }, [locale]);
  const hourOptions = useMemo(() => Array.from({ length: 24 }, (_, index) => {
    const hour = String(index).padStart(2, '0');
    return { value: hour, label: `${hour}:00` };
  }), []);
  const initialTime = isValidPickupTime(existingReservation?.pickupTime) ? existingReservation.pickupTime : '10:00';
  const [startDate, setStartDate] = useState(() => existingReservation?.startDate && pickupDates.includes(existingReservation.startDate) ? existingReservation.startDate : pickupDates[0]);
  const [pickupHour, setPickupHour] = useState(initialTime.slice(0, 2));
  const [days, setDays] = useState(existingReservation?.days ?? 1);
  const [showDateMenu, setShowDateMenu] = useState(false);
  const [dateFocused, setDateFocused] = useState(false);
  const [step, setStep] = useState<'rental' | 'payment'>('rental');
  const [promoDraft, setPromoDraft] = useState(existingReservation?.promoCode ?? '');
  const [appliedPromo, setAppliedPromo] = useState(existingReservation?.promoCode ?? '');
  const [promoMessage, setPromoMessage] = useState('');
  const dateTimer = useRef<number | null>(null);
  const pickupTime = `${pickupHour}:00`;
  const pickupTimeLabel = formatPickupTime(pickupTime, locale);
  const pricing = reservationPriceBreakdown(car, startDate, days, existingReservation?.bookedOn, appliedPromo);
  const total = pricing.total;
  const validStartDate = isValidISODate(startDate) && startDate >= todayISO();
  const copy = getCopy(locale);
  useEffect(() => () => { if (dateTimer.current !== null) window.clearTimeout(dateTimer.current); }, []);
  function openDatePicker() {
    if (dateTimer.current !== null) window.clearTimeout(dateTimer.current);
    setDateFocused(true);
    dateTimer.current = window.setTimeout(() => setShowDateMenu(true), reduceMotion ? 0 : 210);
  }
  function closeDatePicker() {
    if (dateTimer.current !== null) window.clearTimeout(dateTimer.current);
    setShowDateMenu(false);
    dateTimer.current = window.setTimeout(() => setDateFocused(false), reduceMotion ? 0 : 210);
  }
  function applyPromo() {
    const next = promoDraft.trim().toUpperCase();
    const candidate = reservationPriceBreakdown(car, startDate, days, existingReservation?.bookedOn, next);
    if (!next) {
      setAppliedPromo('');
      setPromoMessage('');
      return;
    }
    if (!candidate.discount) {
      setAppliedPromo('');
      setPromoMessage(locale === 'ru' ? 'Промокод не найден' : 'Promo code not found');
      return;
    }
    setPromoDraft(next);
    setAppliedPromo(next);
    setPromoMessage(locale === 'ru' ? `Скидка ₽${candidate.discount.toLocaleString('ru-RU')}` : `₽${candidate.discount.toLocaleString('ru-RU')} discount applied`);
    triggerHaptic('success');
  }
  return <motion.div className="reservation-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? .01 : .24, ease: 'easeOut' }} onClick={onClose}>
    <motion.section className={`reservation-sheet step-${step} ${existingReservation ? 'editing-reservation' : ''}`} role="dialog" aria-modal="true" aria-labelledby="reservation-title" initial={reduceMotion ? { opacity: 0 } : { y: 52, scale: .985, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={reduceMotion ? { opacity: 0 } : { y: 28, scale: .99, opacity: 0 }} transition={reduceMotion ? { duration: .01 } : sheetSpring} drag={reduceMotion ? false : 'y'} dragControls={sheetDragControls} dragListener={false} dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: .2 }} onDragEnd={(_, info) => { if (shouldDismissSheet(info)) onClose(); }} onClick={(event) => { event.stopPropagation(); if (showDateMenu) closeDatePicker(); }}>
      <div className="sheet-grabber-zone" aria-hidden="true" onPointerDown={(event) => sheetDragControls.start(event.nativeEvent)}><span /></div>
      <header className="reservation-header">
        {step === 'payment' ? <motion.button className="reservation-back" whileTap={{ scale: .9 }} onClick={() => setStep('rental')} aria-label={copy.backPrevious}><IconArrowLeft size={21} /></motion.button> : <span className="reservation-header-spacer" />}
        <div><span>{locale === 'ru' ? `Шаг ${step === 'rental' ? '1' : '2'} из 2` : `Step ${step === 'rental' ? '1' : '2'} of 2`}</span><h2 id="reservation-title">{step === 'rental' ? copy.rentalDates : (existingReservation ? copy.updateReservation : copy.confirmReservation)}</h2></div>
        <motion.button whileTap={{ scale: .9 }} onClick={onClose} aria-label={copy.closeReservation}><IconX size={21} /></motion.button>
      </header>
      <div className="reservation-step-viewport">
        <AnimatePresence initial={false} mode="wait">
          {step === 'rental' ? <motion.div key="rental" className={`reservation-scroll-content reservation-step-content ${dateFocused ? 'date-focused' : ''}`} initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -20 }} transition={spring}>
            <AnimatePresence initial={false}>{!dateFocused && <motion.div layout className="reservation-car" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={reduceMotion ? { duration: .01 } : { ...spring, duration: .2 }}><CarImage src={car.image} alt={car.name} /><div><span>{carTypeLabel(locale, car.type)}</span><strong>{car.name}</strong><small>{car.plate} · {copy.centralGrozny}</small></div></motion.div>}</AnimatePresence>
            <motion.section layout="position" className="checkout-section rental-date-section" transition={reduceMotion ? { duration: .01 } : { ...spring, duration: .2 }}>
              <h3>{copy.rentalDates}</h3>
              <div className={`rental-controls ${dateFocused ? 'date-focused' : ''}`}>
                <AnimatePresence initial={false}>{!dateFocused && <motion.div key="duration" className="duration-control" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={reduceMotion ? { duration: .01 } : { ...spring, duration: .2 }}><span>{copy.rentalLength}</span><div><motion.button whileTap={{ scale: .9 }} onClick={() => setDays((current) => Math.max(1, current - 1))} disabled={days === 1} aria-label={copy.decreaseRental}>−</motion.button><strong>{dayCount(locale, days)}</strong><motion.button whileTap={{ scale: .9 }} onClick={() => setDays((current) => Math.min(30, current + 1))} disabled={days === 30} aria-label={copy.increaseRental}>+</motion.button></div></motion.div>}</AnimatePresence>
                <motion.div layout="position" className={`pickup-control ${showDateMenu ? 'open' : ''}`} transition={reduceMotion ? { duration: .01 } : spring}>
                  <span>{copy.pickupDate}</span>
                  <motion.button type="button" whileTap={{ scale: .97 }} onClick={(event) => { event.stopPropagation(); if (dateFocused) closeDatePicker(); else openDatePicker(); }} aria-label={copy.pickupDate} aria-haspopup="dialog" aria-expanded={showDateMenu}><strong>{formatRentalDate(startDate, locale)} · {pickupTimeLabel}</strong><motion.span animate={{ rotate: showDateMenu ? 180 : 0 }} transition={{ duration: reduceMotion ? .01 : .2 }}><IconChevronDown size={16} /></motion.span></motion.button>
                  <AnimatePresence>{showDateMenu && <motion.div className="ios-date-wheel" role="group" aria-label={copy.choosePickupDate} initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12, scaleY: .92 }} animate={{ opacity: 1, y: 0, scaleY: 1 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, scaleY: .94 }} transition={reduceMotion ? { duration: .01 } : { ...spring, duration: .2 }} style={{ transformOrigin: 'top' }} onClick={(event) => event.stopPropagation()} onKeyDown={(event) => { if (event.key === 'Escape') closeDatePicker(); }}>
                    <WheelColumn className="date" options={dateOptions} value={startDate} label={copy.pickupDate} onChange={setStartDate} />
                    <WheelColumn className="hour" options={hourOptions} value={pickupHour} label={locale === 'ru' ? 'Часы' : 'Hour'} onChange={setPickupHour} />
                  </motion.div>}</AnimatePresence>
                </motion.div>
              </div>
              <AnimatePresence initial={false}>{!dateFocused && <motion.p key="range" className={`rental-date-range ${validStartDate ? '' : 'invalid'}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={reduceMotion ? { duration: .01 } : { ...spring, duration: .2 }}><IconClock size={16} /> {validStartDate ? <>{formatRentalDate(startDate, locale)} · {pickupTimeLabel} → {formatRentalDate(addDaysISO(startDate, days), locale)}</> : copy.chooseValidDate}</motion.p>}</AnimatePresence>
            </motion.section>
          </motion.div> : <motion.div key="payment" className="reservation-scroll-content reservation-step-content" initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 20 }} transition={spring}>
            <div className="reservation-car compact"><CarImage src={car.image} alt={car.name} /><div><span>{carTypeLabel(locale, car.type)}</span><strong>{car.name}</strong><small>{formatRentalDate(startDate, locale)} · {pickupTimeLabel} → {formatRentalDate(addDaysISO(startDate, days), locale)}</small></div></div>
            <section className="checkout-section"><h3>{copy.paymentMethod}</h3><div className="mock-payment"><span className="mock-card-icon"><IconCreditCard size={21} /></span><div><strong>{payment.label}</strong><small>TEST •••• {payment.last4}</small></div><span className="selected-payment"><IconCheck size={16} /></span></div><p><IconShieldCheck size={16} /> {copy.developmentPayment}</p></section>
            <section className="checkout-section promo-section"><h3>{locale === 'ru' ? 'Промокод' : 'Promo code'}</h3><div className="promo-field"><input value={promoDraft} onChange={(event) => { setPromoDraft(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 20)); setPromoMessage(''); }} placeholder="GROZNY10" aria-label={locale === 'ru' ? 'Промокод' : 'Promo code'} /><button type="button" onClick={applyPromo}>{locale === 'ru' ? 'Применить' : 'Apply'}</button></div>{promoMessage && <p className={appliedPromo ? 'promo-success' : 'promo-error'} aria-live="polite">{promoMessage}</p>}</section>
            <section className="checkout-section"><h3>{copy.paymentSummary}</h3><div className="checkout-receipt"><div><span>{copy.rental} · {dayCount(locale, days)}</span><b>₽{pricing.rentalFee.toLocaleString('ru-RU')}</b></div><div><span>{locale === 'ru' ? `Ожидание получения · ${dayCount(locale, pricing.waitDays)}` : `Pickup wait · ${dayCount(locale, pricing.waitDays)}`}</span><b>₽{pricing.pickupWaitFee.toLocaleString('ru-RU')}</b></div>{pricing.discount > 0 && <div className="receipt-discount"><span>{locale === 'ru' ? 'Скидка' : 'Discount'} · {appliedPromo}</span><b>−₽{pricing.discount.toLocaleString('ru-RU')}</b></div>}<div><span>{copy.refundableDeposit}</span><b>₽0</b></div><div><strong>{copy.total}</strong><strong>₽{total.toLocaleString('ru-RU')}</strong></div></div></section>
          </motion.div>}
        </AnimatePresence>
      </div>
      <div className="reservation-checkout-actions">
        {step === 'rental' && <motion.div className="rental-live-total" aria-live="polite" layout transition={spring}><span><strong>{copy.total}</strong><small>{locale === 'ru' ? 'Аренда' : 'Rental'} ₽{pricing.rentalFee.toLocaleString('ru-RU')}</small><small>{locale === 'ru' ? 'Ожидание' : 'Pickup wait'} ₽{pickupWaitDailyFee.toLocaleString('ru-RU')} × {pricing.waitDays}</small></span><b>₽{total.toLocaleString('ru-RU')}</b></motion.div>}
        {step === 'rental' ? <motion.button className="confirm-reservation" whileTap={{ scale: .98 }} transition={spring} onClick={() => { closeDatePicker(); setStep('payment'); }} disabled={!validStartDate}>{copy.continue}</motion.button> : <motion.button className="confirm-reservation" whileTap={{ scale: .98 }} transition={spring} onClick={() => onConfirm(startDate, pickupTime, days, appliedPromo)}>{existingReservation ? copy.updateReservation : copy.confirmReservation}</motion.button>}
        {existingReservation && <motion.button className="cancel-edit-reservation" whileTap={{ opacity: .55 }} transition={spring} onClick={onCancel}>{copy.cancelReservation}</motion.button>}
      </div>
    </motion.section>
  </motion.div>;
}

function SecondaryPage({ activeTab, savedIds, signOut, openSavedCar, toggleSaved, reservation, reservationCar, modifyReservation, advanceReservation, onOverlayVisibilityChange, locale, changeLocale, theme, changeTheme, notices, markNoticesRead, profile, payment, licence, saveProfile, savePayment, saveLicence, ratings, saveRating, openSupport, showToast }: { activeTab: Exclude<TabId, 'explore'>; savedIds: number[]; signOut: () => void; openSavedCar: (id: number) => void; toggleSaved: (id: number) => void; reservation: Reservation | null; reservationCar: Car | null; modifyReservation: (id: number) => void; advanceReservation: () => void; onOverlayVisibilityChange: (open: boolean) => void; locale: Locale; changeLocale: (locale: Locale) => void; theme: Theme; changeTheme: (theme: Theme) => void; notices: AppNotice[]; markNoticesRead: () => void; profile: ProfileData; payment: PaymentData; licence: LicenceData; saveProfile: (profile: ProfileData) => void; savePayment: (payment: PaymentData) => void; saveLicence: (licence: LicenceData) => void; ratings: Record<number, number>; saveRating: (tripId: number, value: number) => void; openSupport: () => void; showToast: (message: string) => void }) {
  const reduceMotion = useReducedMotion();
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showFinances, setShowFinances] = useState(false);
  const [showReservation, setShowReservation] = useState(false);
  const [accountSheet, setAccountSheet] = useState<AccountSheetKind | null>(null);
  const totalSpend = trips.reduce((sum, trip) => sum + trip.price, 0);
  const totalDays = trips.reduce((sum, trip) => sum + trip.days, 0);
  const totalDistance = trips.reduce((sum, trip) => sum + trip.distance, 0);
  const copy = getCopy(locale);

  return <section className={`secondary-page secondary-page-${activeTab}`} aria-labelledby={`${activeTab}-title`}>
    <header className="secondary-header"><div><span>CarShare</span><h1 id={`${activeTab}-title`}>{copy[activeTab]}</h1></div></header>
    {activeTab === 'trips' && <div className="secondary-content">
      {reservation && reservationCar && <><div className="section-heading upcoming-heading"><h2>{statusLabel(locale, reservation.status)}</h2></div><motion.button className={`upcoming-reservation status-${reservation.status}`} onClick={() => { onOverlayVisibilityChange(true); setShowReservation(true); window.history.pushState({}, '', '/reservation'); }} whileTap={{ scale: .985 }} transition={spring} aria-label={`${copy.openReservation} ${reservationCar.name}`}><div className="upcoming-car-image"><CarImage src={reservationCar.image} alt={reservationCar.name} /></div><div><span>{statusLabel(locale, reservation.status)}</span><strong>{reservationCar.name}</strong><small>{formatRentalDate(reservation.startDate, locale)} · {formatPickupTime(reservation.pickupTime, locale)} · {dayCount(locale, reservation.days)}</small><p>{copy.centralGrozny}</p></div><IconChevronRight size={18} /></motion.button></>}
      <motion.button className="activity-card activity-card-button" onClick={() => { onOverlayVisibilityChange(true); setShowFinances(true); }} whileTap={{ scale: .985 }} transition={spring} aria-label={copy.openTripActivity}>
        <div><span>{copy.augustActivity}</span><strong>{dayCount(locale, totalDays)}</strong><p>{copy.across} {tripCount(locale, trips.length)}</p><small>{copy.viewSpending} <IconChevronRight size={14} /></small></div>
        <div className="activity-ring"><span>₽{totalSpend.toLocaleString('ru-RU')}</span><small>{copy.total.toLocaleLowerCase()}</small></div>
      </motion.button>
      <div className="section-heading"><h2>{copy.recentTrips}</h2><button onClick={() => { onOverlayVisibilityChange(true); setShowFinances(true); }}>{copy.seeAll} <IconChevronRight size={15} /></button></div>
      <div className="grouped-list">{trips.slice(0, 2).map((trip) => <motion.button className="trip-row" key={trip.id} onClick={() => { onOverlayVisibilityChange(true); setSelectedTrip(trip); }} whileTap={{ backgroundColor: 'rgba(255,255,255,.07)' }} transition={spring} aria-label={`${copy.openTrip} ${trip.car}`}><span className="row-icon green"><IconCheck size={18} /></span><div><strong>{trip.car}</strong><p>{tripDate(locale, trip.date)} · {dayCount(locale, trip.days)}</p><small>{tripPlace(locale, trip.from)} → {tripPlace(locale, trip.to)}</small></div><span className="trip-price">₽{trip.price.toLocaleString('ru-RU')}<IconChevronRight size={16} /></span></motion.button>)}</div>
    </div>}
    {activeTab === 'saved' && <div className="secondary-content"><p className="page-intro">{copy.savedDescription}</p>{savedIds.length ? <div className="vehicle-list"><motion.div className="vehicle-set saved-vehicle-set" layout transition={spring}><AnimatePresence initial={false} mode="popLayout">{cars.filter((car) => savedIds.includes(car.id)).map((car, index) => <motion.article layout className="vehicle-card" key={car.id} role="button" tabIndex={0} onClick={() => openSavedCar(car.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') openSavedCar(car.id); }} aria-label={`${copy.openDetails} ${car.name}`} initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: .96 }} transition={{ ...spring, delay: reduceMotion ? 0 : index * .03 }} whileTap={{ scale: .985 }}><div className="vehicle-photo"><CarImage src={car.image} alt={car.name} /><span className="brand-badge" aria-hidden="true"><img draggable={false} width={22} height={22} loading="lazy" decoding="async" src={carBrandLogo(car.name)} alt="" /></span></div><div className="vehicle-copy"><div className="vehicle-topline"><span>{car.electric && <IconBolt size={12} fill="currentColor" />}{carTypeLabel(locale, car.type)}</span><button className="saved" onClick={(event) => { event.stopPropagation(); toggleSaved(car.id); }} aria-label={`${copy.remove} ${car.name}`}><IconHeart size={19} fill="currentColor" /></button></div><h3>{car.name}</h3><p>{car.plate}</p><div className="vehicle-footer"><strong>₽{car.price.toLocaleString('ru-RU')}</strong></div></div></motion.article>)}</AnimatePresence></motion.div></div> : <div className="saved-empty-state"><IconHeart size={31} /><h2>{locale === 'ru' ? 'Пока ничего не сохранено' : 'Nothing saved yet'}</h2><p>{locale === 'ru' ? 'Нажмите на сердце у автомобиля, чтобы вернуться к нему позже.' : 'Tap the heart on a car to find it here later.'}</p><button type="button" onClick={() => openSavedCar(cars[0].id)}>{locale === 'ru' ? 'Посмотреть автомобили' : 'Browse cars'}</button></div>}</div>}
    {activeTab === 'account' && <div className="secondary-content"><motion.button className="profile-card profile-card-button" whileTap={{ scale: .985 }} onClick={() => { onOverlayVisibilityChange(true); setAccountSheet('profile'); }}><div className="large-avatar">{profile.name.trim().charAt(0).toUpperCase() || 'N'}</div><div><strong>{profile.name}</strong><span>{profile.email}</span></div><IconChevronRight size={19} /></motion.button><div className="section-heading"><h2>{copy.preferences}</h2></div><div className="grouped-list settings-list"><button onClick={() => { onOverlayVisibilityChange(true); setAccountSheet('payment'); }}><span className="row-icon blue"><IconCreditCard size={18} /></span><div><strong>{copy.paymentMethod}</strong><small>{payment.label} ·· {payment.last4}</small></div><IconChevronRight size={18} /></button><button onClick={() => { onOverlayVisibilityChange(true); setAccountSheet('licence'); }}><span className="row-icon purple"><IconId size={18} /></span><div><strong>{copy.drivingDocuments}</strong><small>{licence.verified ? copy.verified : licence.expiry}</small></div><IconChevronRight size={18} /></button><NotificationPermissionRow locale={locale} onStatus={showToast} /><button type="button" onClick={openSupport}><span className="row-icon support"><IconMessageCircle size={18} /></span><div><strong>{locale === 'ru' ? 'Поддержка' : 'Support'}</strong><small>{locale === 'ru' ? 'Чат и помощь 24/7' : 'Chat and help, 24/7'}</small></div><IconChevronRight size={18} /></button><div className="language-setting appearance-setting"><span className="row-icon indigo">{theme === 'dark' ? <IconMoon size={18} /> : <IconSun size={18} />}</span><div><strong>{copy.appearance}</strong><small>{theme === 'dark' ? copy.dark : copy.light}</small></div><div className="language-switch appearance-switch" role="group" aria-label={copy.appearance}><button type="button" className={theme === 'dark' ? 'active' : ''} aria-label={copy.dark} aria-pressed={theme === 'dark'} onClick={() => changeTheme('dark')}><IconMoon size={16} /></button><button type="button" className={theme === 'light' ? 'active' : ''} aria-label={copy.light} aria-pressed={theme === 'light'} onClick={() => changeTheme('light')}><IconSun size={16} /></button></div></div><div className="language-setting"><span className="row-icon language"><IconLanguage size={18} /></span><div><strong>{copy.language}</strong><small>{locale === 'en' ? copy.english : copy.russian}</small></div><div className="language-switch language-code-switch" role="group" aria-label={copy.language}><button type="button" className={locale === 'en' ? 'active' : ''} aria-label={copy.english} aria-pressed={locale === 'en'} onClick={() => changeLocale('en')}><span aria-hidden="true">EN</span></button><button type="button" className={locale === 'ru' ? 'active' : ''} aria-label={copy.russian} aria-pressed={locale === 'ru'} onClick={() => changeLocale('ru')}><span aria-hidden="true">RU</span></button></div></div></div><button className="apple-signout" onClick={signOut}><IconLogout size={18} /> {copy.signOut}</button></div>}

    <AnimatePresence>
      {showReservation && reservation && reservationCar && <ReservationDetail reservation={reservation} car={reservationCar} payment={payment} reduceMotion={!!reduceMotion} onClose={() => { onOverlayVisibilityChange(false); setShowReservation(false); window.history.replaceState({}, '', '/trips'); }} onModify={() => { onOverlayVisibilityChange(false); setShowReservation(false); modifyReservation(reservationCar.id); }} onAdvance={advanceReservation} locale={locale} onStatus={showToast} />}
      {selectedTrip && <TripDetail trip={selectedTrip} reduceMotion={!!reduceMotion} onClose={() => { onOverlayVisibilityChange(false); setSelectedTrip(null); }} locale={locale} rating={ratings[selectedTrip.id] ?? 0} onRate={(value) => saveRating(selectedTrip.id, value)} />}
      {showFinances && <FinanceDetail totalSpend={totalSpend} totalDays={totalDays} totalDistance={totalDistance} reduceMotion={!!reduceMotion} onClose={() => { onOverlayVisibilityChange(false); setShowFinances(false); }} onSelectTrip={(trip) => { setShowFinances(false); setSelectedTrip(trip); }} locale={locale} />}
      {accountSheet && <AccountSheet kind={accountSheet} locale={locale} reduceMotion={!!reduceMotion} profile={profile} payment={payment} licence={licence} notices={notices} onClose={() => { onOverlayVisibilityChange(false); setAccountSheet(null); }} onSaveProfile={(next) => { saveProfile(next); onOverlayVisibilityChange(false); setAccountSheet(null); }} onSavePayment={(next) => { savePayment(next); onOverlayVisibilityChange(false); setAccountSheet(null); }} onSaveLicence={(next) => { saveLicence(next); onOverlayVisibilityChange(false); setAccountSheet(null); }} onMarkRead={markNoticesRead} />}
    </AnimatePresence>
  </section>;
}

function AccountSheet({ kind, locale, reduceMotion, profile, payment, licence, notices, onClose, onSaveProfile, onSavePayment, onSaveLicence, onMarkRead }: { kind: AccountSheetKind; locale: Locale; reduceMotion: boolean; profile: ProfileData; payment: PaymentData; licence: LicenceData; notices: AppNotice[]; onClose: () => void; onSaveProfile: (profile: ProfileData) => void; onSavePayment: (payment: PaymentData) => void; onSaveLicence: (licence: LicenceData) => void; onMarkRead: () => void }) {
  const sheetDragControls = useDragControls();
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
    <motion.section className={`feature-sheet account-sheet ${kind === 'notifications' ? 'notifications-sheet' : ''}`} role="dialog" aria-modal="true" aria-labelledby="account-sheet-title" initial={reduceMotion ? { opacity: 0 } : { y: 42, scale: .985, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={reduceMotion ? { opacity: 0 } : { y: 24, opacity: 0 }} transition={reduceMotion ? { duration: .01 } : sheetSpring} drag={reduceMotion ? false : 'y'} dragControls={sheetDragControls} dragListener={false} dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: .2 }} onDragEnd={(_, info) => { if (shouldDismissSheet(info)) onClose(); }} onClick={(event) => event.stopPropagation()}>
      <div className="sheet-grabber-zone" aria-hidden="true" onPointerDown={(event) => sheetDragControls.start(event.nativeEvent)}><span /></div>
      <header className="feature-sheet-header"><div><span>CarShare</span><h2 id="account-sheet-title">{title}</h2></div><motion.button whileTap={{ scale: .9 }} onClick={onClose} aria-label={text.close}><IconX size={21} /></motion.button></header>
      {kind === 'notifications' ? <div className="notification-center"><div className="notification-list">{notices.length ? notices.slice(0, 4).map((notice) => { const item = noticeCopy(locale, notice); return <article key={notice.id} className={notice.read ? 'read' : ''}><span><IconBell size={17} /></span><div><strong>{item.title}</strong><p>{item.body}</p><small>{new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(notice.createdAt))}</small></div></article>; }) : <div className="empty-notifications"><IconBell size={28} /><p>{text.noNotifications}</p></div>}</div>{notices.length > 0 && <motion.button className="primary-action notification-read-action" whileTap={{ scale: .98 }} onClick={onMarkRead} disabled={!notices.some((notice) => !notice.read)}>{notices.some((notice) => !notice.read) ? text.markAllRead : text.allRead}</motion.button>}</div> : <form className="account-form" onSubmit={submit}>
        {kind === 'profile' && <><label>{text.fullName}<input autoComplete="name" value={profileDraft.name} maxLength={40} aria-invalid={!profileValidity.name} onChange={(event) => setProfileDraft({ ...profileDraft, name: event.target.value.replace(/[^\p{L}\s'’-]/gu, '').slice(0, 40) })} required /><small className={profileValidity.name ? '' : 'invalid'}>{text.nameRule}</small></label><label>{getCopy(locale).email}<input type="email" autoComplete="email" value={profileDraft.email} maxLength={80} aria-invalid={!profileValidity.email} onChange={(event) => setProfileDraft({ ...profileDraft, email: event.target.value.replace(/\s/g, '').slice(0, 80) })} required /><small className={profileValidity.email ? '' : 'invalid'}>{text.emailRule}</small></label><label>{text.phone}<input type="tel" inputMode="tel" autoComplete="tel" value={profileDraft.phone} maxLength={22} aria-invalid={!profileValidity.phone} onChange={(event) => setProfileDraft({ ...profileDraft, phone: event.target.value.replace(/[^\d+()\-\s]/g, '').slice(0, 22) })} required /><small className={profileValidity.phone ? '' : 'invalid'}>{text.phoneRule}</small></label></>}
        {kind === 'payment' && <><div className="mock-data-banner"><IconShieldCheck size={18} />{text.mockOnly}</div><label>{text.cardLabel}<input value={paymentDraft.label} onChange={(event) => setPaymentDraft({ ...paymentDraft, label: event.target.value })} required /></label><label>{text.lastFour}<input inputMode="numeric" value={paymentDraft.last4} maxLength={4} onChange={(event) => setPaymentDraft({ ...paymentDraft, last4: event.target.value.replace(/\D/g, '').slice(0, 4) })} required pattern="\d{4}" /></label></>}
        {kind === 'licence' && <><label>{text.licenceNumber}<input value={licenceDraft.number} onChange={(event) => setLicenceDraft({ ...licenceDraft, number: event.target.value })} required /></label><label>{text.expiry}<input value={licenceDraft.expiry} onChange={(event) => setLicenceDraft({ ...licenceDraft, expiry: event.target.value })} placeholder="08/2030" required /></label><label className="verification-toggle"><input type="checkbox" checked={licenceDraft.verified} onChange={(event) => setLicenceDraft({ ...licenceDraft, verified: event.target.checked })} /><span><IconCheck size={16} /></span>{text.verifiedStatus}</label></>}
        <motion.button className="primary-action" type="submit" whileTap={{ scale: .98 }} disabled={kind === 'profile' && !profileIsValid}>{text.saveChanges}</motion.button>
      </form>}
    </motion.section>
  </motion.div>;
}

function DetailHeader({ title, subtitle, backLabel, onClose, actionLabel, onAction }: { title: string; subtitle: string; backLabel: string; onClose: () => void; actionLabel?: string; onAction?: () => void }) {
  return <header className="trip-detail-header"><motion.button whileTap={{ scale: .9 }} onClick={onClose} aria-label={backLabel}><IconArrowLeft size={22} /></motion.button><div><span>{subtitle}</span><h2>{title}</h2></div>{actionLabel && onAction ? <motion.button className="header-text-action" whileTap={{ opacity: .55 }} onClick={onAction}>{actionLabel}</motion.button> : <span className="header-spacer" />}</header>;
}

function ActiveRentalDetail({ reservation, car, reduceMotion, backLabel, onClose, onComplete, locale, onStatus }: { reservation: Reservation; car: Car; reduceMotion: boolean; backLabel: string; onClose: () => void; onComplete: () => void; locale: Locale; onStatus?: (message: string) => void }) {
  const swipeRef = useHorizontalGestureLock<HTMLElement>();
  const [locked, setLocked] = useState(false);
  const [lightsOn, setLightsOn] = useState(false);
  const [supportReady, setSupportReady] = useState(false);
  const [showDamageReport, setShowDamageReport] = useState(false);
  const copy = getCopy(locale);
  const text = featureText[locale];
  const endDate = addDaysISO(reservation.startDate, reservation.days);
  const remainingDays = Math.max(0, Math.min(reservation.days, daysBetweenISO(todayISO(), endDate)));
  return <motion.section ref={swipeRef} className="trip-overlay active-rental-page horizontal-swipe-surface" initial={reduceMotion ? { opacity: 0 } : { x: '100%' }} animate={{ x: 0, opacity: 1 }} exit={reduceMotion ? { opacity: 0 } : { x: '100%' }} transition={spring} drag={reduceMotion ? false : 'x'} dragConstraints={{ left: 0, right: 0 }} dragElastic={{ left: 0, right: .2 }} dragDirectionLock onDragEnd={(_, info) => { if (shouldSwipeBack(info)) onClose(); }} aria-labelledby="active-rental-title">
    <DetailHeader title={car.name} subtitle={text.active} backLabel={backLabel} onClose={onClose} />
    <div className="active-rental-content">
      <section className="active-drive-card">
        <div className="active-drive-status"><i /><span>{text.activeNow}</span><small>{reservation.confirmation}</small></div>
        <CarImage src={car.image} alt={car.name} priority />
        <div className="active-drive-copy"><span>{carTypeLabel(locale, car.type)}</span><h1 id="active-rental-title">{car.name}</h1><p>{car.plate} · {copy.centralGrozny}</p></div>
      </section>
      <section className="active-time-card"><div><small>{text.remaining}</small><strong>{dayCount(locale, remainingDays)}</strong></div><div><small>{text.returnBy}</small><strong>{formatRentalDate(endDate, locale)} · {formatPickupTime(reservation.pickupTime, locale)}</strong></div></section>
      <section className="active-control-section"><h3>{text.vehicleControls}</h3><div className="active-control-grid">
        <motion.button className={locked ? 'enabled' : ''} whileTap={{ scale: .96 }} aria-pressed={locked} onClick={() => { setLocked((value) => !value); triggerHaptic('impact'); }}>{locked ? <IconLock size={21} /> : <IconLockOpen size={21} />}<span>{locked ? text.unlockCar : text.lockCar}</span></motion.button>
        <motion.button className={lightsOn ? 'enabled' : ''} whileTap={{ scale: .96 }} aria-pressed={lightsOn} onClick={() => { setLightsOn((value) => !value); triggerHaptic('impact'); }}><IconBulb size={21} /><span>{text.lights}</span></motion.button>
        <motion.button className={supportReady ? 'enabled' : ''} whileTap={{ scale: .96 }} aria-pressed={supportReady} onClick={() => { setSupportReady((value) => !value); triggerHaptic('impact'); }}><IconPhone size={21} /><span>{text.support}</span></motion.button>
      </div></section>
      <section className="active-return-card"><div className="active-route-visual" aria-hidden="true"><span><IconCar size={18} /></span><i /><span><IconMapPin size={18} /></span></div><div><small>{text.routeBack}</small><strong>{copy.centralGroznyZone}</strong><p>{text.returnBy} {formatRentalDate(endDate, locale)} · {formatPickupTime(reservation.pickupTime, locale)}</p></div><IconRoute size={21} /></section>
      <div className="active-product-actions"><PickupNavigationButton locale={locale} label={locale === 'ru' ? 'Маршрут возврата' : 'Navigate to return'} /><button type="button" className="secondary-product-action danger-quiet" onClick={() => setShowDamageReport(true)}><IconAlertTriangle size={19} />{locale === 'ru' ? 'Сообщить о повреждении' : 'Report damage'}</button></div>
      <p className="active-safety-note"><IconShieldCheck size={17} /> {copy.tripSupport}</p>
    </div>
    <footer className="active-rental-footer"><motion.button className="primary-action" whileTap={{ scale: .98 }} onClick={onComplete}>{text.completeRental}</motion.button></footer>
    <AnimatePresence>{showDamageReport && <DamageReportSheet locale={locale} onClose={() => setShowDamageReport(false)} onSaved={(summary) => { localStorage.setItem(`carshare-damage-${reservation.confirmation}`, summary); setShowDamageReport(false); onStatus?.(locale === 'ru' ? 'Отчёт сохранён' : 'Damage report saved'); triggerHaptic('success'); }} />}</AnimatePresence>
  </motion.section>;
}

function ReservationDetail({ reservation, car, payment, reduceMotion, backLabel, onClose, onModify, onAdvance, locale, onStatus }: { reservation: Reservation; car: Car; payment: PaymentData; reduceMotion: boolean; backLabel?: string; onClose: () => void; onModify: () => void; onAdvance: () => void; locale: Locale; onStatus?: (message: string) => void }) {
  const swipeRef = useHorizontalGestureLock<HTMLElement>();
  const copy = getCopy(locale);
  const text = featureText[locale];
  const endDate = addDaysISO(reservation.startDate, reservation.days);
  const pickupTimeLabel = formatPickupTime(reservation.pickupTime, locale);
  const pricing = reservationPriceBreakdown(car, reservation.startDate, reservation.days, reservation.bookedOn, reservation.promoCode);
  const canModify = reservation.status === 'confirmed' || reservation.status === 'ready';
  const lifecycleAction = reservation.status === 'confirmed' || reservation.status === 'ready' ? text.startRental : text.close;
  if (reservation.status === 'active') return <ActiveRentalDetail reservation={reservation} car={car} reduceMotion={reduceMotion} backLabel={backLabel ?? copy.backTrips} onClose={onClose} onComplete={onAdvance} locale={locale} onStatus={onStatus} />;
  return <motion.section ref={swipeRef} className="trip-overlay reservation-detail horizontal-swipe-surface" initial={reduceMotion ? { opacity: 0 } : { x: '100%' }} animate={{ x: 0, opacity: 1 }} exit={reduceMotion ? { opacity: 0 } : { x: '100%' }} transition={spring} drag={reduceMotion ? false : 'x'} dragConstraints={{ left: 0, right: 0 }} dragElastic={{ left: 0, right: .2 }} dragDirectionLock onDragEnd={(_, info) => { if (shouldSwipeBack(info)) onClose(); }} aria-labelledby="reservation-detail-title">
    <DetailHeader title={copy.reservation} subtitle={statusLabel(locale, reservation.status)} backLabel={backLabel ?? copy.backTrips} onClose={onClose} actionLabel={canModify ? copy.modifyReservation : undefined} onAction={canModify ? onModify : undefined} />
    <div className="trip-overlay-content">
      <section className={`reservation-overview lifecycle-status status-${reservation.status}`}>
        <div className="reservation-overview-status"><span className="completion-mark"><IconCheck size={20} /></span><div><p>{statusLabel(locale, reservation.status)}</p><small>{copy.confirmation} {reservation.confirmation}</small></div></div>
        <div className="reservation-overview-dates"><h2 id="reservation-detail-title">{formatRentalDate(reservation.startDate, locale)} → {formatRentalDate(endDate, locale)}</h2><span>{dayCount(locale, reservation.days)}</span></div>
        <div className="reservation-overview-car"><CarImage src={car.image} alt={car.name} /><div><span>{carTypeLabel(locale, car.type)}</span><strong>{car.name}</strong><small>{car.plate} · ₽{car.price.toLocaleString('ru-RU')}/{locale === 'ru' ? 'сутки' : 'day'}</small></div></div>
      </section>
      <section className="detail-block"><h3>{copy.pickupInstructions}</h3><div className="pickup-instructions"><span className="row-icon blue"><IconMapPin size={18} /></span><div><strong>{copy.centralGroznyZone}</strong><p>{locale === 'ru' ? 'Получение' : 'Pickup'} {formatRentalDate(reservation.startDate, locale)} · {pickupTimeLabel}</p><small><IconId size={15} /> {copy.bringLicence}</small></div></div><PickupNavigationButton locale={locale} /></section>
      <section className="detail-block"><h3>{copy.paymentSummary}</h3><div className="receipt-list"><div><span>{copy.rental} · {dayCount(locale, reservation.days)}</span><b>₽{pricing.rentalFee.toLocaleString('ru-RU')}</b></div>{pricing.pickupWaitFee > 0 && <div><span>{locale === 'ru' ? 'Ожидание получения' : 'Pickup wait'}</span><b>₽{pricing.pickupWaitFee.toLocaleString('ru-RU')}</b></div>}{pricing.discount > 0 && <div className="receipt-discount"><span>{locale === 'ru' ? 'Скидка' : 'Discount'} · {reservation.promoCode}</span><b>−₽{pricing.discount.toLocaleString('ru-RU')}</b></div>}<div><span>{payment.label} ·· {payment.last4}</span><b className="payment-paid"><IconCheck size={14} /> {copy.paid}</b></div><div><span>{copy.refundableDeposit}</span><b>₽0</b></div><div><span>{copy.total}</span><b>₽{reservation.total.toLocaleString('ru-RU')}</b></div></div></section>
    </div>
    <footer className="reservation-action-bar">
      <motion.button className="primary-action lifecycle-action" whileTap={{ scale: .98 }} transition={spring} onClick={reservation.status === 'completed' ? onClose : onAdvance}>{lifecycleAction}</motion.button>
    </footer>
  </motion.section>;
}

function TripDetail({ trip, reduceMotion, onClose, locale, rating, onRate }: { trip: Trip; reduceMotion: boolean; onClose: () => void; locale: Locale; rating: number; onRate: (value: number) => void }) {
  const swipeRef = useHorizontalGestureLock<HTMLElement>();
  const copy = getCopy(locale);
  return <motion.section ref={swipeRef} className="trip-overlay trip-detail-page horizontal-swipe-surface" initial={reduceMotion ? { opacity: 0 } : { x: '100%' }} animate={{ x: 0, opacity: 1 }} exit={reduceMotion ? { opacity: 0 } : { x: '100%' }} transition={spring} drag={reduceMotion ? false : 'x'} dragConstraints={{ left: 0, right: 0 }} dragElastic={{ left: 0, right: .2 }} dragDirectionLock onDragEnd={(_, info) => { if (shouldSwipeBack(info)) onClose(); }} aria-labelledby="trip-detail-title">
    <DetailHeader title={copy.tripReceipt} subtitle={`${tripDate(locale, trip.date)} → ${tripDate(locale, trip.endDate)}`} backLabel={copy.backTrips} onClose={onClose} />
    <div className="trip-overlay-content">
      <section className="trip-total"><span className="completion-mark"><IconCheck size={22} /></span><p>{copy.completed}</p><strong>₽{trip.price.toLocaleString('ru-RU')}</strong><small>{trip.car} · {dayCount(locale, trip.days)}</small></section>
      <div className="trip-metrics"><div><IconClock size={20} /><span>{copy.duration}<strong>{dayCount(locale, trip.days)}</strong></span></div><div><IconRoute size={20} /><span>{copy.distance}<strong>{trip.distance} {locale === 'ru' ? 'км' : 'km'}</strong></span></div></div>
      <section className="detail-block"><h3>{copy.route}</h3><div className="route-timeline"><div><i /><span><small>{copy.start}</small><strong>{tripPlace(locale, trip.from)}</strong><p>{tripDate(locale, trip.date)} · {trip.time}</p></span></div><div><i /><span><small>{copy.finish}</small><strong>{tripPlace(locale, trip.to)}</strong><p>{tripDate(locale, trip.endDate)} · {trip.endTime}</p></span></div></div></section>
      <section className="detail-block"><h3>{copy.paymentDetails}</h3><div className="receipt-list"><div><span>{copy.drivingTime} · {dayCount(locale, trip.days)}</span><b>₽{trip.rentalFee.toLocaleString('ru-RU')}</b></div><div><span>{copy.parking}</span><b>₽{trip.extras.toLocaleString('ru-RU')}</b></div><div><span>{copy.total}</span><b>₽{trip.price.toLocaleString('ru-RU')}</b></div></div></section>
      <section className="detail-block trip-feedback"><h3>{locale === 'ru' ? 'Оценка поездки' : 'Trip feedback'}</h3><p>{locale === 'ru' ? 'Оцените автомобиль и впечатления от аренды.' : 'Rate the car and your rental experience.'}</p><RatingControl locale={locale} value={rating} onChange={onRate} /><ReceiptDownloadButton trip={trip} locale={locale} /></section>
      <p className="trip-support"><IconShieldCheck size={17} /> {copy.tripSupport}</p>
    </div>
  </motion.section>;
}

function FinanceDetail({ totalSpend, totalDays, totalDistance, reduceMotion, onClose, onSelectTrip, locale }: { totalSpend: number; totalDays: number; totalDistance: number; reduceMotion: boolean; onClose: () => void; onSelectTrip: (trip: Trip) => void; locale: Locale }) {
  const swipeRef = useHorizontalGestureLock<HTMLElement>();
  const budget = 40000;
  const rentalSpend = trips.reduce((sum, trip) => sum + trip.rentalFee, 0);
  const extrasSpend = trips.reduce((sum, trip) => sum + trip.extras, 0);
  const rentalShare = Math.round(rentalSpend / totalSpend * 100);
  const extrasShare = 100 - rentalShare;
  const copy = getCopy(locale);
  return <motion.section ref={swipeRef} className="trip-overlay finance-detail-page horizontal-swipe-surface" initial={reduceMotion ? { opacity: 0 } : { x: '100%' }} animate={{ x: 0, opacity: 1 }} exit={reduceMotion ? { opacity: 0 } : { x: '100%' }} transition={spring} drag={reduceMotion ? false : 'x'} dragConstraints={{ left: 0, right: 0 }} dragElastic={{ left: 0, right: .2 }} dragDirectionLock onDragEnd={(_, info) => { if (shouldSwipeBack(info)) onClose(); }} aria-labelledby="finance-title">
    <DetailHeader title={copy.tripActivity} subtitle={copy.augustOverview} backLabel={copy.backTrips} onClose={onClose} />
    <div className="trip-overlay-content finance-content">
      <section className="finance-hero"><span>{copy.spentMonth}</span><strong>₽{totalSpend.toLocaleString('ru-RU')}</strong><p>₽{Math.round(totalSpend / trips.length).toLocaleString('ru-RU')} {copy.averageTrip}</p><div className="budget-label"><span>{copy.monthlyBudget}</span><b>₽{totalSpend.toLocaleString('ru-RU')} {copy.of} ₽{budget.toLocaleString('ru-RU')}</b></div><div className="budget-track"><motion.i initial={{ width: 0 }} animate={{ width: `${Math.min(100, totalSpend / budget * 100)}%` }} transition={spring} /></div><small>₽{Math.max(0, budget - totalSpend).toLocaleString('ru-RU')} {copy.remaining}</small></section>
      <div className="finance-metrics"><div><IconRoute size={20} /><strong>{totalDistance.toFixed(0)} {locale === 'ru' ? 'км' : 'km'}</strong><span>{copy.totalDistance}</span></div><div><IconClock size={20} /><strong>{dayCount(locale, totalDays)}</strong><span>{copy.driveTime}</span></div><div><IconCreditCard size={20} /><strong>{trips.length}</strong><span>{copy.rentals}</span></div></div>
      <section className="detail-block"><h3>{copy.spendingBreakdown}</h3><div className="spend-breakdown"><div><span><i className="blue-dot" />{copy.driving}</span><b>₽{rentalSpend.toLocaleString('ru-RU')} <small>{rentalShare}%</small></b></div><div><span><i className="purple-dot" />{copy.parking}</span><b>₽{extrasSpend.toLocaleString('ru-RU')} <small>{extrasShare}%</small></b></div></div></section>
      <section className="detail-block"><h3>{copy.allTrips}</h3><div className="finance-trip-list">{trips.map((trip) => <button key={trip.id} onClick={() => onSelectTrip(trip)}><span><strong>{trip.car}</strong><small>{tripDate(locale, trip.date)} · {dayCount(locale, trip.days)}</small></span><b>₽{trip.price.toLocaleString('ru-RU')}<IconChevronRight size={16} /></b></button>)}</div></section>
    </div>
  </motion.section>;
}
