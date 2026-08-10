import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  return NextResponse.json({ error: 'Pagamentos não configurados' }, { status: 503 })
}
