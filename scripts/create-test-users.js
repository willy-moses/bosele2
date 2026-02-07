const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUsers() {
  try {
    console.log('🔄 Creating test users...')

    // Admin user
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        name: 'Admin User',
        username: 'admin',
        email: 'admin@boselekgotla.bw',
        password: adminPassword,
        role: 'ADMIN'
      }
    })
    console.log('✅ Admin created:', admin.username)

    // Editor user
    const editorPassword = await bcrypt.hash('editor123', 10)
    const editor = await prisma.user.upsert({
      where: { username: 'editor' },
      update: {},
      create: {
        name: 'Editor User',
        username: 'editor',
        email: 'editor@boselekgotla.bw',
        password: editorPassword,
        role: 'EDITOR'
      }
    })
    console.log('✅ Editor created:', editor.username)

    // Viewer user
    const viewerPassword = await bcrypt.hash('viewer123', 10)
    const viewer = await prisma.user.upsert({
      where: { username: 'viewer' },
      update: {},
      create: {
        name: 'Viewer User',
        username: 'viewer',
        email: 'viewer@boselekgotla.bw',
        password: viewerPassword,
        role: 'VIEWER'
      }
    })
    console.log('✅ Viewer created:', viewer.username)

    console.log('\n🎉 Test users created successfully!')
    console.log('\n📝 Login credentials:')
    console.log('Admin   → username: admin   | password: admin123')
    console.log('Editor  → username: editor  | password: editor123')
    console.log('Viewer  → username: viewer  | password: viewer123')

  } catch (error) {
    console.error('❌ Error creating test users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUsers()