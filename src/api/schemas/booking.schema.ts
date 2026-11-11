import { z } from 'zod';

/**
 * Zod schemas double as runtime contract checks: every API response is parsed
 * against one, so a changed/missing field fails the test with a clear message.
 */
export const bookingDatesSchema = z.object({
  checkin: z.string(),
  checkout: z.string(),
});

export const bookingSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  totalprice: z.number(),
  depositpaid: z.boolean(),
  bookingdates: bookingDatesSchema,
  additionalneeds: z.string().optional(),
});

export const createBookingResponseSchema = z.object({
  bookingid: z.number(),
  booking: bookingSchema,
});

export const bookingIdListSchema = z.array(z.object({ bookingid: z.number() }));

export const authResponseSchema = z.object({ token: z.string() });

export type Booking = z.infer<typeof bookingSchema>;
export type CreateBookingResponse = z.infer<typeof createBookingResponseSchema>;
