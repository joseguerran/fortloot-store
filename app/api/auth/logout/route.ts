import { NextResponse } from 'next/server'
import { clearSessionCookie } from '@/lib/auth/cookies'

/**
 * POST /api/auth/logout
 * Clear the session cookie to log out the user
 */
export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  })

  return clearSessionCookie(response)
}
