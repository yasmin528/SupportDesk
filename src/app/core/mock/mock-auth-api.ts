import { HttpRequest } from '@angular/common/http';
import { AuthResponse, LoginRequest, SignupRequest, User } from '../../models/user.model';
import {
  MockHttpError,
  Session,
  StoredUser,
  createId,
  hashPassword,
  nowIso,
  readTable,
  toPublicUser,
  writeTable,
} from './mock-db';
import { seedUsers } from './seed-data';

function users(): StoredUser[] {
  return readTable<StoredUser>('users', seedUsers);
}

function sessions(): Session[] {
  return readTable<Session>('sessions');
}

function startSession(user: StoredUser): AuthResponse {
  const session: Session = { token: createId(), userId: user.id, createdAt: nowIso() };
  writeTable('sessions', [...sessions(), session]);
  return { token: session.token, user: toPublicUser(user) };
}

function readToken(req: HttpRequest<unknown>): string | null {
  const header = req.headers.get('Authorization');
  return header?.startsWith('Bearer ') ? header.slice(7) : null;
}

export function requireUserId(req: HttpRequest<unknown>): string {
  const token = readToken(req);
  const session = sessions().find((item) => item.token === token);
  if (!session) {
    throw new MockHttpError(401, 'Your session has expired. Please log in again.');
  }
  return session.userId;
}

export async function register(body: SignupRequest): Promise<AuthResponse> {
  const email = body.email.trim().toLowerCase();
  const all = users();
  if (all.some((user) => user.email === email)) {
    throw new MockHttpError(409, 'An account with this email already exists.');
  }
  const salt = createId();
  const user: StoredUser = {
    id: createId(),
    name: body.name.trim(),
    email,
    salt,
    passwordHash: await hashPassword(body.password, salt),
  };
  writeTable('users', [...all, user]);
  return startSession(user);
}

export async function login(body: LoginRequest): Promise<AuthResponse> {
  const email = body.email.trim().toLowerCase();
  const user = users().find((item) => item.email === email);
  const hash = user ? await hashPassword(body.password, user.salt) : null;
  if (!user || hash !== user.passwordHash) {
    throw new MockHttpError(401, 'Invalid email or password.');
  }
  return startSession(user);
}

export function logout(req: HttpRequest<unknown>): null {
  const token = readToken(req);
  writeTable(
    'sessions',
    sessions().filter((session) => session.token !== token),
  );
  return null;
}

export function me(req: HttpRequest<unknown>): User {
  const userId = requireUserId(req);
  const user = users().find((item) => item.id === userId);
  if (!user) {
    throw new MockHttpError(401, 'User no longer exists.');
  }
  return toPublicUser(user);
}
