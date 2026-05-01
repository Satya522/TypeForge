'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'sonner'
import NotificationManager from '@/components/NotificationManager'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'
import { ThemeProvider } from '@/components/ThemeProvider'
import {
  PremiumMotionProvider,
  ScrollProgressChrome,
} from '@/components/motion'

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <NotificationManager />
        <PremiumMotionProvider>
          <ScrollProgressChrome />
          {children}
        </PremiumMotionProvider>
      </ThemeProvider>
      <Toaster position="bottom-right" richColors />
      <ServiceWorkerRegister />
    </SessionProvider>
  )
}
