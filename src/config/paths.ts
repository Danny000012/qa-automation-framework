import path from 'node:path';

const root = path.resolve(__dirname, '../..');

/** Where the authenticated browser session is stored by the setup project. */
export const STORAGE_STATE = path.join(root, '.auth', 'user.json');
