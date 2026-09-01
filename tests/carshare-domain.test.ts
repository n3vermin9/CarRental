import assert from 'node:assert/strict';
import test from 'node:test';
import {
  cars, createReservation, isValidISODate, isValidPickupTime, parseAppPath,
  promoDiscount, reservationPriceBreakdown,
} from '../app/carshare-domain.ts';

test('app paths resolve to tabs and detail state', () => {
  assert.deepEqual(parseAppPath('/trips'), { tab: 'trips', carId: null, reservation: false });
  assert.deepEqual(parseAppPath('/cars/3'), { tab: 'explore', carId: 3, reservation: false });
  assert.deepEqual(parseAppPath('/reservation'), { tab: 'trips', carId: null, reservation: true });
  assert.deepEqual(parseAppPath('/cars/999'), { tab: 'explore', carId: null, reservation: false });
});

test('date and time validation rejects malformed values', () => {
  assert.equal(isValidISODate('2026-09-01'), true);
  assert.equal(isValidISODate('2026-02-30'), false);
  assert.equal(isValidPickupTime('23:00'), true);
  assert.equal(isValidPickupTime('24:00'), false);
});

test('pickup waiting fee and promo update the total', () => {
  const car = cars[0];
  const pricing = reservationPriceBreakdown(car, '2026-09-04', 2, '2026-09-01', 'WELCOME500');
  assert.deepEqual(pricing, { waitDays: 3, rentalFee: 9800, pickupWaitFee: 1500, subtotal: 11300, discount: 500, total: 10800 });
  assert.equal(promoDiscount('GROZNY10', 40000), 2500);
});

test('reservation stores the computed promo price', () => {
  const reservation = createReservation(cars[0], '2026-09-02', '10:00', 1, 'CR-TEST', '2026-09-01', 'GROZNY10');
  assert.equal(reservation.total, 4860);
  assert.equal(reservation.discount, 540);
  assert.equal(reservation.promoCode, 'GROZNY10');
});
