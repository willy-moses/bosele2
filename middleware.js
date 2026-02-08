import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname
    
    // Check if accessing admin routes
    const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/dashboard')
    const isAdminApiRoute = pathname.startsWith('/api/admin')
    
    // If accessing admin/dashboard routes, verify admin role
    if ((isAdminRoute || isAdminApiRoute) && token?.role !== 'admin') {
      // Redirect to login if not authenticated
      if (!token) {
        return NextResponse.redirect(new URL('/admin/login', req.url))
      }
      // Redirect to unauthorized if authenticated but not admin
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        
        // Allow login page without authentication
        if (pathname === '/admin/login' || pathname === '/auth/login') {
          return true
        }
        
        // For admin routes, require authentication (role check happens in middleware function)
        if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard') || pathname.startsWith('/api/admin')) {
          return !!token
        }
        
        // Allow all other routes
        return true
      }
    },
    pages: {
      signIn: '/admin/login',
    }
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*', 
    '/api/admin/:path*'
  ]
}