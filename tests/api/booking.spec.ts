import { expect, test } from '@fixtures/test';
import { buildBooking } from '@utils/data-factory';

test.describe('Booking API', () => {
  test('health check responds', { tag: '@smoke' }, async ({ bookingApi }) => {
    const response = await bookingApi.ping();

    expect(response.status()).toBe(201);
  });

  test('creates a booking', { tag: '@smoke' }, async ({ bookingApi }) => {
    const payload = buildBooking();

    const created = await bookingApi.create(payload);

    expect(created.bookingid).toBeGreaterThan(0);
    expect(created.booking).toEqual(payload);
  });

  test('retrieves a booking by id', { tag: '@smoke' }, async ({ bookingApi, createdBooking }) => {
    const booking = await bookingApi.get(createdBooking.id);

    expect(booking).toEqual(createdBooking.booking);
  });

  test(
    'lists bookings filtered by name',
    { tag: '@regression' },
    async ({ bookingApi, createdBooking }) => {
      const ids = await bookingApi.list({
        firstname: createdBooking.booking.firstname,
        lastname: createdBooking.booking.lastname,
      });

      expect(ids).toContain(createdBooking.id);
    },
  );

  test(
    'replaces a booking (PUT)',
    { tag: '@regression' },
    async ({ bookingApi, createdBooking }) => {
      const replacement = buildBooking();

      const updated = await bookingApi.update(createdBooking.id, replacement);

      expect(updated).toEqual(replacement);
      expect(await bookingApi.get(createdBooking.id)).toEqual(replacement);
    },
  );

  test(
    'partially updates a booking (PATCH)',
    { tag: '@regression' },
    async ({ bookingApi, createdBooking }) => {
      const updated = await bookingApi.partialUpdate(createdBooking.id, {
        firstname: 'Updated',
        totalprice: 999,
      });

      expect(updated).toEqual({ ...createdBooking.booking, firstname: 'Updated', totalprice: 999 });
    },
  );

  test('deletes a booking', { tag: '@regression' }, async ({ bookingApi, createdBooking }) => {
    await bookingApi.delete(createdBooking.id);

    const response = await bookingApi.getRaw(createdBooking.id);
    expect(response.status()).toBe(404);
  });

  test(
    'rejects updates without credentials',
    { tag: '@regression' },
    async ({ bookingApi, createdBooking }) => {
      const response = await bookingApi.updateUnauthenticated(createdBooking.id, buildBooking());

      expect(response.status()).toBe(403);
    },
  );

  test('returns 404 for an unknown booking', { tag: '@regression' }, async ({ bookingApi }) => {
    const response = await bookingApi.getRaw(0);

    expect(response.status()).toBe(404);
  });
});
