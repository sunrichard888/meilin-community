const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://tgffujhcruemykdviluw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZ1amhjcnVlbXlrZHZpbHV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU3OTIxNywiZXhwIjoyMDg5MTU1MjE3fQ.jdBirw-9pQXx8YJA65Azq0cPpEOHUYDNJasva0xj0_U'
);

async function main() {
  const email = 'admin@meilin.tech';
  const nickname = '美邻网管理员';
  
  console.log('=== 创建管理员账号 ===\n');
  
  // 检查用户是否已存在
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, role')
    .eq('email', email)
    .single();

  if (existingUser) {
    console.log(`✅ 用户 ${email} 已存在`);
    if (existingUser.role === 'admin') {
      console.log('✅ 该用户已是管理员');
    } else {
      console.log('🔄 正在提升为管理员...');
      const { error } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('email', email);
      
      if (error) {
        console.error('❌ 提升失败:', error.message);
      } else {
        console.log('✅ 已成功提升为管理员！');
      }
    }
    return;
  }

  console.log('⚠️  用户不存在，需要手动创建：');
  console.log('\n1. 访问：https://tgffujhcruemykdviluw.supabase.co/dashboard/auth/users');
  console.log('2. 点击 "Add user" → "Create new user"');
  console.log('3. 填写信息：');
  console.log(`   邮箱：${email}`);
  console.log('   密码：Meilin2026!@#');
  console.log('4. 创建后再次运行此脚本，或直接执行 SQL：');
  console.log(`   UPDATE users SET role = 'admin' WHERE email = '${email}';`);
}

main();
