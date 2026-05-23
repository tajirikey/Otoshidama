import { NextRequest, NextResponse } from 'next/server'

const DATA_KEY = 'otoshidama_data'

// KVが利用可能かチェック
function isKvAvailable(){
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
}

// メモリキャッシュ（KV未設定時のフォールバック）
let memoryStore: any = null

async function getKv(){
  if(!isKvAvailable()) return null
  try{
    const { kv } = await import('@vercel/kv')
    return kv
  }catch(e){
    return null
  }
}

// データ取得
export async function GET(request: NextRequest) {
  try {
    const kv = await getKv()
    if(kv){
      const data = await kv.get(DATA_KEY)
      return NextResponse.json({ data: data || null })
    }
    // KV未設定時はメモリから返す
    return NextResponse.json({ data: memoryStore })
  } catch (error) {
    console.error('Data fetch error:', error)
    return NextResponse.json({ data: memoryStore })
  }
}

// データ保存
export async function POST(request: NextRequest) {
  try {
    const { data } = await request.json()
    const kv = await getKv()
    if(kv){
      await kv.set(DATA_KEY, data)
    }else{
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
