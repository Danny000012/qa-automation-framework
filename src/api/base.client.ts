import { expect, type APIRequestContext, type APIResponse } from '@playwright/test';
import type { z } from 'zod';

/**
 * Base class for API service clients. Wraps Playwright's APIRequestContext and
 * adds status assertion + schema validation in one place.
 */
export abstract class BaseApiClient {
  constructor(protected readonly request: APIRequestContext) {}

  protected async parse<S extends z.ZodType>(
    response: APIResponse,
    schema: S,
    expectedStatus = 200,
  ): Promise<z.output<S>> {
    expect(
      response.status(),
      `${response.url()} returned ${response.status()}: ${await response.text()}`,
    ).toBe(expectedStatus);

    const body: unknown = await response.json();
    return schema.parse(body);
  }
}
