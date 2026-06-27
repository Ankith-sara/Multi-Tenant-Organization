import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-12345';

// Retrieves and verifies the session from cookies
export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  if (!sessionCookie) return null;

  try {
    const token = sessionCookie.value;
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}

// Encrypts user information into JWT and sets cookie
export async function setSession(payload) {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/'
  });
}

// Deletes session cookie
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Expire immediately
    path: '/'
  });
}
