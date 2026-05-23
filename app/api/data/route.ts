import { NextRequest, NextResponse } from 'next/server'

const DATA_KEY = 'otoshidama_data'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function isKvAvailable() {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
}

let memoryStore: any = null

async function getKv() {
  if (!isKvAvailable()) return null
  try {
    const { Redis } = await import('@upstash/redis')
    return new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    })
  } catch (e) {
    console.error('Upstash Redis import failed:', e)
    return null
  }
}

export async function GET(_request: NextRequest) {
  try {
    const kv = await getKv()
    if (kv) {
      const data = await kv.get(DATA_KEY)
      return NextResponse.json({ data: data ?? null, source: 'kv' })
    }
    if (process.env.NODE_ENV === 'production') {
      console.warn('Upstash Redis is not configured.')
    }
    return NextResponse.json({ data: memoryStore, source: 'memory' })
  } catch (error) {
    console.error('Data fetch error:', error)
    return NextResponse.json(
      { data: null, error: 'データ取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = body?.data
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { success: false, error: 'data が不正です' },
        { status: 400 }
      )
    }
    const kv = await getKv()
    if (kv) {
      await kv.set(DATA_KEY, data)
    } else {
      memoryStore = data
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Data save error:', error)
    return NextResponse.json(
      { success: false, error: '保存に失敗しました' },
      { status: 500 }
    )
  }
}
