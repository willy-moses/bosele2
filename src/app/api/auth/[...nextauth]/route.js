import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Define authOptions separately to avoid export issues
const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          const { data: user, error } = await supabase
            .from('staff_users')
            .select('*')
            .eq('email', credentials.email.toLowerCase())
            .single()

          if (error || !user) {
            return null
          }

          const isValid = await bcrypt.compare(credentials.password, user.password)

          if (!isValid) {
            return null
          }

          // Update last login
          await supabase
            .from('staff_users')
            .update({ lastLogin: new Date().toISOString() })
            .eq('id', user.id)

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role
        session.user.id = token.id
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Create the handler
const handler = NextAuth(authOptions)

// Export the handler as GET and POST
export { handler as GET, handler as POST }

// Export authOptions for use in other files (like API routes)
// This is safe because it's not exported as a route handler
export { authOptions }