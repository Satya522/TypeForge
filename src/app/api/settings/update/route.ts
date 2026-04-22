import { NextRequest, NextResponse } from 'next/server'
import { getServerAuthSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { checkRateLimit } from '@/lib/rate-limit'
import { getClientIp, sanitizePlainText } from '@/lib/request-security'

// Accept any combination of settings fields (partial updates)
const bodySchema = z.object({
  soundEnabled: z.boolean().optional(),
  leaderboardVisible: z.boolean().optional(),
  dailyGoal: z.number().int().min(1).max(50).optional(),
  preferredDuration: z
    .enum(['S15', 'S30', 'S60', 'S120', 'S180', 'S240', 'S300'])
    .optional(),
  reducedMotion: z.boolean().optional(),
  accentColor: z.string().min(1).max(30).optional(),
  fontFamily: z.string().min(1).max(80).optional(),
  fontSize: z.number().int().min(12).max(28).optional(),
  notificationsEnabled: z.boolean().optional(),
  theme: z.enum(['dark', 'light']).optional(),
  language: z.string().min(2).max(12).optional(),
})

export async function POST(req: NextRequest) {
  const session = await getServerAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const ip = getClientIp(req)
    const rateLimit = checkRateLimit(
      `settings:${session.user.id}:${ip}`,
      20,
      5 * 60 * 1000
    )
    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: 'Too many settings updates. Please wait a bit.' },
        { status: 429 }
      )
    }

    const json = await req.json()
    const parsed = bodySchema.safeParse(json)
    if (!parsed.success) {
      console.error('[Settings] Validation error:', parsed.error)
      return NextResponse.json(
        { error: 'Invalid settings payload' },
        { status: 400 }
      )
    }

    // Only include fields that were provided
    const data: Record<string, any> = {}

    if (parsed.data.soundEnabled !== undefined)
      data.soundEnabled = parsed.data.soundEnabled
    if (parsed.data.leaderboardVisible !== undefined)
      data.leaderboardVisible = parsed.data.leaderboardVisible
    if (parsed.data.dailyGoal !== undefined)
      data.dailyGoal = parsed.data.dailyGoal
    if (parsed.data.preferredDuration !== undefined)
      data.preferredDuration = parsed.data.preferredDuration
    if (parsed.data.reducedMotion !== undefined)
      data.reducedMotion = parsed.data.reducedMotion
    if (parsed.data.accentColor !== undefined)
      data.accentColor = sanitizePlainText(parsed.data.accentColor, 30)
    if (parsed.data.fontFamily !== undefined)
      data.fontFamily = sanitizePlainText(parsed.data.fontFamily, 80)
    if (parsed.data.fontSize !== undefined) data.fontSize = parsed.data.fontSize
    if (parsed.data.notificationsEnabled !== undefined)
      data.notificationsEnabled = parsed.data.notificationsEnabled
    if (parsed.data.theme !== undefined) data.theme = parsed.data.theme
    if (parsed.data.language !== undefined)
      data.language = sanitizePlainText(parsed.data.language, 12)

    const userId = session.user.id
    await prisma.userSettings.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    })
    return NextResponse.json({ message: 'Settings updated' })
  } catch (error) {
    console.error('[Settings] Update failed:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
