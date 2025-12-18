'use client'

import { customSessionClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

import type { Auth } from '~/auth/index'

export const authClient = createAuthClient({
  plugins: [customSessionClient<Auth>()],
})

export const {
  useSession,
  signIn,
  signOut,
  getSession,
} = authClient

export interface ExtendedUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  login?: string
}

export interface ExtendedSession {
  user: ExtendedUser
  session: {
    id: string
    userId: string
    expiresAt: Date
  }
}
