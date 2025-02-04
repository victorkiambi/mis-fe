'use server';

import { cookies } from 'next/headers';

export async function setAuthCookie(token: string) {
  (await cookies()).set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  });
}

export async function removeAuthCookie() {
  (await cookies()).delete('token');
}

export async function getAuthCookie() {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value;
}
