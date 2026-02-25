import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    const isAdminRoute = pathname.startsWith('/dashboard')
    const isAdminApiRoute = pathname.startsWith('/api/admin')

    if ((isAdminRoute || isAdminApiRoute) && token?.role !== 'admin') {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/login', req.url))
      }
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname

        // Always allow login and role-redirect pages
        if (
          pathname === '/auth/login' ||
          pathname === '/auth/role-redirect'
        ) {
          return true
        }

        // For dashboard/admin routes, require authentication
        if (
          pathname.startsWith('/dashboard') ||
          pathname.startsWith('/api/admin')
        ) {
          return !!token
        }

        // Allow everything else
        return true
      }
    },
    pages: {
      signIn: '/auth/login',
    }
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/admin/:path*',
  ]
}