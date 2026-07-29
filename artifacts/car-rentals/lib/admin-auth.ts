import { timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

/**
 * True when the request carries a valid admin session cookie. Used by the admin
 * layout and by every /api/admin route, which are otherwise unauthenticated.
 */
export async function isAdmin(): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return false
  const token = (await cookies()).get('admin_token')?.value
  if (!token) return false
  return safeEqual(token, expected)
}
