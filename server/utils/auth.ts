import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import type { H3Event } from 'h3'

export const AUTH_COOKIE = 'wb_auth'

function getSecret() {
  const config = useRuntimeConfig()
  return new TextEncoder().encode((config.jwtSecret as string) || 'webbuilder-dev-secret')
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(password, hashed)
}

export async function signToken(userId: string, role: string): Promise<string> {
  return new SignJWT({ sub: userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<{ sub: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return { sub: payload.sub as string, role: payload.role as string }
  } catch {
    return null
  }
}

export async function requireAuth(event: H3Event): Promise<{ sub: string; role: string }> {
  const token = getCookie(event, AUTH_COOKIE)
  if (!token) throw createError({ statusCode: 401, message: 'Unauthorized' })
  const payload = await verifyToken(token)
  if (!payload) throw createError({ statusCode: 401, message: 'Unauthorized' })
  return payload
}
