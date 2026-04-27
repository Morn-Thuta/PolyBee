import { NextResponse } from 'next/server'

/**
 * This test endpoint has been deprecated.
 * Use /api/modules for module operations instead.
 */
export async function GET() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

export async function POST() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

export async function DELETE() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
