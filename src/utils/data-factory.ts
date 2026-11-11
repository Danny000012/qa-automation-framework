import { faker } from '@faker-js/faker';
import type { Booking } from '@api/schemas/booking.schema';

export interface CheckoutInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

const toIsoDate = (date: Date): string => date.toISOString().slice(0, 10);

/** Random but valid checkout details. Pass overrides to pin specific fields. */
export function buildCheckoutInfo(overrides: Partial<CheckoutInfo> = {}): CheckoutInfo {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    postalCode: faker.location.zipCode(),
    ...overrides,
  };
}

/** Random but valid booking payload. Pass overrides to pin specific fields. */
export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  const checkin = faker.date.soon({ days: 30 });
  const checkout = faker.date.soon({ days: 7, refDate: checkin });

  return {
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    totalprice: faker.number.int({ min: 100, max: 1000 }),
    depositpaid: faker.datatype.boolean(),
    bookingdates: { checkin: toIsoDate(checkin), checkout: toIsoDate(checkout) },
    additionalneeds: faker.helpers.arrayElement(['Breakfast', 'Late checkout', 'Parking']),
    ...overrides,
  };
}
