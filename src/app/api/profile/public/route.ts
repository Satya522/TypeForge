import { NextRequest, NextResponse } from 'next/server'
import { getPublicProfileSummary } from '@/lib/profile-server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing user id.' }, { status: 400 })
  }

  const profile = await getPublicProfileSummary(id)
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found.' }, { status: 404 })
  }

  return NextResponse.json({ profile })
}
