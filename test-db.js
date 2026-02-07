const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function test() {
  try {
    console.log('Testing database connection...');
    
    // Test 1: Find all users
    const users = await prisma.user.findMany();
    console.log('✅ Users found:', users.length);
    
    // Test 2: Find admin user
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@boselekgotla.bw' }
    });
    console.log('✅ Admin user:', admin ? admin.email : 'NOT FOUND');
    
    // Test 3: Test password comparison
    if (admin) {
      const isValid = await bcrypt.compare('admin123', admin.password);
      console.log('✅ Password check:', isValid ? 'CORRECT' : 'WRONG');
      console.log('Password in DB starts with:', admin.password.substring(0, 10));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();