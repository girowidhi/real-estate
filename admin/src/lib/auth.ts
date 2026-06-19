import { cookies } from 'next/headers';
import { supabaseAdmin } from './db';

const SESSION_COOKIE = 'admin_session';
const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface SessionData {
  userId: string;
  email: string;
  name: string;
  role: string;
  expiresAt: number;
}

function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export async function createSession(userId: string, email: string, name: string, role: string) {
  const cookieStore = await cookies();
  const token = generateToken();
  const expiresAt = Date.now() + SESSION_EXPIRY;
  const sessionData: SessionData = { userId, email, name, role, expiresAt };
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_EXPIRY / 1000,
  });
  await supabaseAdmin
    .from('admin_sessions')
    .upsert({ token, data: sessionData, expires_at: new Date(expiresAt).toISOString() }, { onConflict: 'token' });
  return token;
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const { data } = await supabaseAdmin
    .from('admin_sessions')
    .select('data')
    .eq('token', token)
    .gte('expires_at', new Date().toISOString())
    .single();
  if (!data) return null;
  return data.data as SessionData;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await supabaseAdmin.from('admin_sessions').delete().eq('token', token);
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  return session;
}
