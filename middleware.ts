import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PASSWORD = process.env.PASSWORD || 'sayasei3367'

export function middleware(request: NextRequest) {
  // パスワードがCookieに保存されているかチェック
  const authCookie = request.cookies.get('auth')

  // /api/auth へのリクエストはスキップ
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // 認証済みの場合
  if (authCookie?.value === PASSWORD) {
    return NextResponse.next()
  }

  // 未認証の場合はログインページへリダイレクト
  if (request.nextUrl.pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
