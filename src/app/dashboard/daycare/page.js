import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DayCareDashboard from '@/components/daycare/dashboard/DayCareDashboard'

const DAYCARE_ROLES = ['DAY_CARE_PRINCIPAL', 'DAY_CARE_TEACHER']

export default async function DaycareDashboardPage() {
  const session = await getServerSession(authOptions)

  // Not logged in → back to login
  if (!session) {
    redirect('/auth/login')
  }

  // Wrong role trying to access this URL directly → back to their dashboard
  if (!DAYCARE_ROLES.includes(session.user.role?.toUpperCase())) {
    redirect('/dashboard')
  }

  return <DayCareDashboard user={session.user} />
}