import { env } from '@config/env';

/** Demo users for saucedemo.com. Replace with your own application's test users. */
export const users = {
  standard: { username: env.UI_USERNAME, password: env.UI_PASSWORD },
  lockedOut: { username: 'locked_out_user', password: env.UI_PASSWORD },
};

export const products = {
  backpack: 'Sauce Labs Backpack',
  bikeLight: 'Sauce Labs Bike Light',
  boltTShirt: 'Sauce Labs Bolt T-Shirt',
};
