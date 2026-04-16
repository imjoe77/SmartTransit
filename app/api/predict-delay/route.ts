import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { predictDelay, parseDelayPrediction } from '@/lib/rag'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { routeId, busId, dayOfWeek, scheduledDeparture } = await req.json()

  if (!routeId || !busId || dayOfWeek === undefined || !scheduledDeparture) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const raw = await predictDelay(routeId, busId, dayOfWeek, scheduledDeparture)
  const parsed = parseDelayPrediction(raw)

  return NextResponse.json({ prediction: parsed, raw })
}