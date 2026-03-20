const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://tgffujhcruemykdviluw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZ1amhjcnVlbXlrZHZpbHV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU3OTIxNywiZXhwIjoyMDg5MTU1MjE3fQ.jdBirw-9pQXx8YJA65Azq0cPpEOHUYDNJasva0xj0_U'
);

async function main() {
  const email = 'tempadmin@meilin.tech';
  const nickname = '临时管理员';
  
  console.log('=== 设置临时管理员账号 ===\n');
  
  // 检查用户是否已存在
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, role, nickname')
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
  } else {
    console.log('🔄 创建新用户记录...');
    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        nickname,
        role: 'admin',
        avatar: null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ 创建失败:', error.message);
    } else {
      console.log('✅ 用户记录已创建！');
      console.log('\n⚠️  注意：需要在 Supabase Auth 中创建对应的登录用户');
    }
  }
  
  console.log('\n📋 管理员账号信息：');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📧 邮箱：${email}`);
  console.log('🔑 密码：使用"忘记密码"功能设置');
  console.log('👤 昵称：临时管理员');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📝 登录步骤：');
  console.log('1. 访问：https://community.ling-q.tech/login');
  console.log('2. 点击"忘记密码"');
  console.log(`3. 输入邮箱：${email}`);
  console.log('4. 查收邮件设置密码');
  console.log('5. 使用新密码登录');
  console.log('\n🔐 或者在 Supabase Dashboard 手动设置密码：');
  console.log('https://tgffujhcruemykdviluw.supabase.co/dashboard/auth/users');
}

main();
