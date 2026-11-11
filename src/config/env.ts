import path from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

/**
 * Environment schema. Every value has a default pointing at the public demo
 * targets (saucedemo.com + restful-booker) so the framework runs out of the box.
 * Override them in `.env` locally, or via CI variables / secrets, to point at
 * your own application.
 */
const envSchema = z.object({
  UI_BASE_URL: z.url().default('https://www.saucedemo.com'),
  UI_USERNAME: z.string().min(1).default('standard_user'),
  UI_PASSWORD: z.string().min(1).default('secret_sauce'),

  API_BASE_URL: z.url().default('https://restful-booker.herokuapp.com'),
  API_USERNAME: z.string().min(1).default('admin'),
  API_PASSWORD: z.string().min(1).default('password123'),
});

export type Env = z.infer<typeof envSchema>;

// Treat empty strings (e.g. unset CI variables) as "not provided" so defaults apply.
const provided = Object.fromEntries(
  Object.entries(process.env).filter(([, value]) => value !== undefined && value !== ''),
);

const parsed = envSchema.safeParse(provided);

if (!parsed.success) {
  throw new Error(`Invalid environment configuration:\n${z.prettifyError(parsed.error)}`);
}

export const env: Env = parsed.data;
