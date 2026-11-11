import { expect, type APIRequestContext, type APIResponse } from '@playwright/test';
import { BaseApiClient } from '../base.client';
import {
  authResponseSchema,
  bookingIdListSchema,
  bookingSchema,
  createBookingResponseSchema,
  type Booking,
  type CreateBookingResponse,
} from '../schemas/booking.schema';

export interface ApiCredentials {
  username: string;
  password: string;
}

export interface BookingFilter {
  firstname?: string;
  lastname?: string;
}

/**
 * Typed client for the booking API. Authenticates lazily the first time a
 * protected endpoint is called, and remembers every booking it creates so the
 * fixture can clean them up after each test.
 */
export class BookingService extends BaseApiClient {
  private token?: string;
  private readonly createdIds: number[] = [];

  constructor(
    request: APIRequestContext,
    private readonly credentials: ApiCredentials,
  ) {
    super(request);
  }

  async ping(): Promise<APIResponse> {
    return this.request.get('/ping');
  }

  async getToken(): Promise<string> {
    if (!this.token) {
      const response = await this.request.post('/auth', { data: this.credentials });
      const { token } = await this.parse(response, authResponseSchema);
      this.token = token;
    }
    return this.token;
  }

  async list(filter: BookingFilter = {}): Promise<number[]> {
    const response = await this.request.get('/booking', { params: { ...filter } });
    const items = await this.parse(response, bookingIdListSchema);
    return items.map((item) => item.bookingid);
  }

  async get(id: number): Promise<Booking> {
    return this.parse(await this.getRaw(id), bookingSchema);
  }

  /** Returns the raw response, for negative tests (e.g. asserting a 404). */
  async getRaw(id: number): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`);
  }

  async create(payload: Booking): Promise<CreateBookingResponse> {
    const response = await this.request.post('/booking', { data: payload });
    const result = await this.parse(response, createBookingResponseSchema);
    this.createdIds.push(result.bookingid);
    return result;
  }

  async update(id: number, payload: Booking): Promise<Booking> {
    const response = await this.request.put(`/booking/${id}`, {
      data: payload,
      headers: await this.authHeaders(),
    });
    return this.parse(response, bookingSchema);
  }

  async partialUpdate(id: number, payload: Partial<Booking>): Promise<Booking> {
    const response = await this.request.patch(`/booking/${id}`, {
      data: payload,
      headers: await this.authHeaders(),
    });
    return this.parse(response, bookingSchema);
  }

  /** Sends an update with no credentials, for authorisation tests. */
  async updateUnauthenticated(id: number, payload: Booking): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, { data: payload });
  }

  async delete(id: number): Promise<void> {
    const response = await this.request.delete(`/booking/${id}`, {
      headers: await this.authHeaders(),
    });
    expect(response.status(), `DELETE /booking/${id}: ${await response.text()}`).toBe(201);
  }

  /** Deletes every booking created through this service. Never throws. */
  async cleanup(): Promise<void> {
    for (const id of this.createdIds.splice(0)) {
      try {
        const response = await this.request.delete(`/booking/${id}`, {
          headers: await this.authHeaders(),
        });
        void response; // already-deleted bookings return 405; that is fine.
      } catch {
        // Cleanup must never fail a test.
      }
    }
  }

  private async authHeaders(): Promise<Record<string, string>> {
    return { Cookie: `token=${await this.getToken()}` };
  }
}
