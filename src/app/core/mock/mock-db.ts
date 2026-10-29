import { User } from '../../models/user.model';

export interface StoredUser extends User {
  salt: string;
  passwordHash: string;
}

export interface Session {
  token: string;
  userId: string;
  createdAt: string;
}

export class MockHttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

const DB_PREFIX = 'supportdesk.mockdb.';
const FAIL_FLAG = 'supportdesk.mock.fail';

export function readTable<T>(name: string, seed: () => T[] = () => []): T[] {
  const raw = localStorage.getItem(DB_PREFIX + name);
  if (raw) {
    return JSON.parse(raw) as T[];
  }
  const rows = seed();
  writeTable(name, rows);
  return rows;
}

export function writeTable<T>(name: string, rows: T[]): void {
  localStorage.setItem(DB_PREFIX + name, JSON.stringify(rows));
}

export function createId(): string {
  return crypto.randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function shouldSimulateFailure(): boolean {
  return localStorage.getItem(FAIL_FLAG) === 'true';
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function toPublicUser(user: StoredUser): User {
  return { id: user.id, name: user.name, email: user.email };
}
