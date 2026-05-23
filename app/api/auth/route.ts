import { NextRequest, NextResponse } from 'next/server'

const PASSWORD = process.env.PASSWORD || 'sayasei3367'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (password === PASSWORD) {
      const response = NextResponse.json({ success: true })

      response.cookies.set('auth', PASSWORD, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30日
        path: '/',
      })

      return response
    }

    return NextResponse.json(
      { success: false, error: 'パスワードが間違っています' },
      { status: 401 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '認証エラー' },
      { status: 500 }
    )
  }
}

// ログアウト
export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('auth')
  return response
}
