import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log('🔐 Attempting login for:', credentials?.email)
          
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const { data, error } = await supabaseAdmin
            .from('staff_users')
            .select('*')
            .eq('email', credentials.email)
            .single()

          if (error) {
            console.log('❌ Database error:', error.message)
            return null
          }

          if (!data) {
            console.log('❌ User not found:', credentials.email)
            return null
          }

          console.log('✅ User found:', data.email, 'Role:', data.role)

          const isHashed = data.password.startsWith('$2')
          let isValidPassword = false
          
          if (isHashed) {
            isValidPassword = await bcrypt.compare(credentials.password, data.password)
            console.log('🔒 Password check (hashed):', isValidPassword)
          } else {
            isValidPassword = credentials.password === data.password
            console.log('⚠️  Password check (plain text):', isValidPassword)
          }

          if (!isValidPassword) {
            console.log('❌ Invalid password for:', credentials.email)
            return null
          }

          console.log('✅ Auth successful for:', credentials.email, 'Role:', data.role)
          
          return {
            id: data.id,
            email: data.email,
            name: data.name || data.username,
            role: data.role.toLowerCase()
          }
        } catch (error) {
          console.error('❌ Auth error:', error)
          return null
        }
      }
    })
  ],

  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: '/auth/login',
  },

  callbacks: {
    // ── After Google sign-in, look up the user's role in staff_users ──
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          const { data } = await supabaseAdmin
            .from('staff_users')
            .select('role')
            .eq('email', user.email!)
            .single()

          if (!data) {
            // Email not in staff_users — deny access
            console.log('❌ Google sign-in denied: not a staff member:', user.email)
            return '/auth/login?error=AccessDenied'
          }

          // Attach role so jwt callback can pick it up
          user.role = data.role.toLowerCase()
          console.log('✅ Google sign-in allowed:', user.email, 'Role:', user.role)
        } catch {
          return '/auth/login?error=AccessDenied'
        }
      }
      return true
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.role = user.role
        token.name = user.name
      }
      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.email = token.email!
        session.user.role = token.role
        session.user.name = token.name!
      }
      return session
    },

    // ── Send Google users to role-redirect; leave everything else alone ──
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url
      if (url.startsWith('/')) return `${baseUrl}${url}`
      return baseUrl
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}