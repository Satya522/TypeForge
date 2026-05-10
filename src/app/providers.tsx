'use client'

import type { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'
import { Toaster } from 'sonner'
import NotificationManager from '@/components/NotificationManager'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'
import { ThemeProvider } from '@/components/ThemeProvider'
import {
  PremiumMotionProvider,
  ScrollProgressChrome,
} from '@/components/motion'
import { PremiumEffectsLayer } from '@/components/premium'

interface ProvidersProps {
  children: ReactNode
  session: Session | null
}

const AUTH_ROUTE_PREFIXES = ['/login', '/register']

export default function Providers({ children, session }: ProvidersProps) {
  const pathname = usePathname() ?? '/'
  const isAuthRoute = AUTH_ROUTE_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  useEffect(() => {
    if (!isAuthRoute) {
      return undefined
    }

    const root = document.documentElement
    root.dataset.premiumMotion = 'auth'
    root.style.removeProperty('--motion-ambient-y')
    root.style.removeProperty('--scroll-progress')

    return () => {
      if (root.dataset.premiumMotion === 'auth') {
        delete root.dataset.premiumMotion
      }
    }
  }, [isAuthRoute])

  return (
    <SessionProvider
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
      session={session}
    >
      <ThemeProvider>
        <NotificationManager />
        {isAuthRoute ? (
          children
        ) : (
          <PremiumMotionProvider>
            <ScrollProgressChrome />
            <PremiumEffectsLayer />
            {children}
          </PremiumMotionProvider>
        )}
      </ThemeProvider>
      <Toaster position="bottom-right" richColors />
      <ServiceWorkerRegister />
    </SessionProvider>
  )
}
