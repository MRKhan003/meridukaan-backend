import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

export const storagePath = process.env.VERCEL
  ? join(tmpdir(), 'meri-dukaan-storage')
  : resolve(process.env.STORAGE_PATH || './storage');

export const invoicesPath = join(storagePath, 'invoices');

export function initializeStorage(): void {
  mkdirSync(invoicesPath, {
    recursive: true,
  });
}