import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  try {
    const PASSWORD = process.env.PASSWORD || 'sayasei3367'
    const { pathname } = request.nextUrl

    // 認証APIと静的アセットはスキップ
    if (
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/_next') ||
      pathname === '/favicon.ico'
    ) {
      return NextResponse.next()
    }

    const authCookie = request.cookies.get('auth')

    // 認証済みの場合
    if (authCookie?.value === PASSWORD) {
      return NextResponse.next()
    }

    // ログインページは通す
    if (pathname === '/login') {
      return NextResponse.next()
    }

    // 未認証の場合はログインページへリダイレクト
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
