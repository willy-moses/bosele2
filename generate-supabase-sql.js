const bcrypt = require('bcryptjs')

async function generateSQL() {
  console.log('🔐 Generating SQL with hashed passwords...\n')
  
  const adminPassword = await bcrypt.hash('admin123', 10)
  const editorPassword = await bcrypt.hash('editor123', 10)
  const viewerPassword = await bcrypt.hash('viewer123', 10)

  const sql = `
-- ========================================
-- RUN THIS SQL IN SUPABASE SQL EDITOR
-- ========================================

-- Insert test users with hashed passwords
INSERT INTO staff_users (id, name, username, email, password, role, "createdAt", "updatedAt")
VALUES 
  ('admin_001', 'Admin User', 'admin', 'admin@boselekgotla.bw', '${adminPassword}', 'ADMIN', NOW(), NOW()),
  ('editor_001', 'Editor User', 'editor', 'editor@boselekgotla.bw', '${editorPassword}', 'EDITOR', NOW(), NOW()),
  ('viewer_001', 'Viewer User', 'viewer', 'viewer@boselekgotla.bw', '${viewerPassword}', 'VIEWER', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  "updatedAt" = NOW();

-- Verify users were created
SELECT id, name, username, email, role, "createdAt" FROM staff_users;
`

  console.log(sql)
  console.log('\n\n========================================')
  console.log('✅ COPY THE SQL ABOVE')
  console.log('========================================')
  console.log('1. Go to Supabase.com')
  console.log('2. Open SQL Editor')
  console.log('3. Paste the SQL')
  console.log('4. Click RUN')
  console.log('\n📝 Login credentials after running SQL:')
  console.log('Email: admin@boselekgotla.bw')
  console.log('Password: admin123')
  console.log('========================================\n')
}

generateSQL()
