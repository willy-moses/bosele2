'use client'
import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

function getDashboardRoute(role: string) {
  switch (role?.toUpperCase()) {
    case 'DAY_CARE_PRINCIPAL':
    case 'DAY-CARE-PRINCIPAL':
    case 'DAY_CARE_TEACHER':
    case 'DAY-CARE-TEACHER':
      return '/dashboard/daycare'
    case 'ADMIN':
    case 'STAFF':
    default:
      return '/dashboard'
  }
}

export default function RoleRedirectPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.replace('/auth/login')
      return
    }

    const route = getDashboardRoute(session?.user?.role ?? '')
    router.replace(route)
  }, [session, status, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Signing you in…</p>
        <p className="text-gray-400 text-sm mt-1">Redirecting to your dashboard</p>
      </div>
    </div>
  )
}