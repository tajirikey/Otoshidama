import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const PASSWORD = process.env.PASSWORD || 'sayasei3367'
  const pathname = request.nextUrl.pathname

  // ログインページとAPIルートはスキップ
  if (pathname === '/login' || pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // 認証チェック
  const auth = request.cookies.get('auth')?.value
  if (auth === PASSWORD) {
    return NextResponse.next()
  }

  // 未認証 → ログインページへ
  return NextResponse.redirect(new URL('/login', request.url))
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
}
