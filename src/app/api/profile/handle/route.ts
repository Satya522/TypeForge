import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { isValidHandle, normalizeHandle } from '@/lib/profile'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const value = normalizeHandle(searchParams.get('value'))

  if (!value) {
    return NextResponse.json({ available: false, error: 'Missing handle value.' }, { status: 400 })
  }

  if (!isValidHandle(value)) {
    return NextResponse.json({ available: false })
  }

  const existing = await prisma.user.findFirst({
    where: { handle: value },
    select: { id: true },
  })

  return NextResponse.json({ available: !existing })
}
