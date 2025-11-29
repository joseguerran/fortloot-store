/**
 * Cookie utilities for secure session management
 * All session tokens are stored in httpOnly cookies for XSS protection
 */

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const SESSION_COOKIE_NAME = 'fortloot_session'
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 // 30 days in seconds

interface CookieOptions {
  httpOnly: boolean
  secure: boolean
  sameSite: 'strict' | 'lax' | 'none'
  path: string
  maxAge: number
}

function getCookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production'

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  }
}

/**
 * Get session token from httpOnly cookie
 * Use this in API routes to authenticate requests
 */
export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE_NAME)?.value
}

/**
 * Set session token in httpOnly cookie on a NextResponse
 * Use this when creating or refreshing sessions
 */
export function setSessionCookie(response: NextResponse, token: string): NextResponse {
  const options = getCookieOptions()

  response.cookies.set(SESSION_COOKIE_NAME, token, options)

  return response
}

/**
 * Clear session cookie (for logout)
 */
export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // Expire immediately
  })

  return response
}

/**
 * Get the session token from request cookies
 * Use when you need to read from the request instead of the cookie store
 */
export function getSessionTokenFromRequest(request: Request): string | undefined {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return undefined

  const cookies = cookieHeader.split(';').map(c => c.trim())
  const sessionCookie = cookies.find(c => c.startsWith(`${SESSION_COOKIE_NAME}=`))

  if (!sessionCookie) return undefined

  return sessionCookie.split('=')[1]
}
