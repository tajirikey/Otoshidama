import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

const DATA_KEY = 'otoshidama_data'

// データ取得
export async function GET(request: NextRequest) {
  try {
    const data = await kv.get(DATA_KEY)
    return NextResponse.json({ data: data || null })
  } catch (error) {
    console.error('Data fetch error:', error)
    return NextResponse.json({ data: null })
  }
}

// データ保存
export async function POST(request: NextRequest) {
  try {
    const { data } = await request.json()
    await kv.set(DATA_KEY, data)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Data save error:', error)
    return NextResponse.json(
      { success: false, error: '保存に失敗しました' },
      { status: 500 }
    )
  }
}
