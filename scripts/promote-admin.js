const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://tgffujhcruemykdviluw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZ1amhjcnVlbXlrZHZpbHV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU3OTIxNywiZXhwIjoyMDg5MTU1MjE3fQ.jdBirw-9pQXx8YJA65Azq0cPpEOHUYDNJasva0xj0_U'
);

async function main() {
  const email = '56455611@qq.com';
  
  console.log('=== 提升管理员 ===\n');
  
  // 查询用户
  const { data: user, error: queryError } = await supabase
    .from('users')
    .select('id, nickname, email, role')
    .eq('email', email)
    .single();

  if (queryError || !user) {
    console.error('❌ 用户不存在:', queryError?.message);
    return;
  }

  console.log(`📋 当前用户信息：`);
  console.log(`   昵称：${user.nickname}`);
  console.log(`   邮箱：${user.email}`);
  console.log(`   角色：${user.role}`);

  if (user.role === 'admin') {
    console.log('\n✅ 该用户已是管理员，无需提升');
    return;
  }

  // 提升为管理员
  console.log('\n🔄 正在提升为管理员...');
  const { data, error } = await supabase
    .from('users')
    .update({ role: 'admin' })
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    console.error('❌ 提升失败:', error.message);
    return;
  }

  console.log('✅ 已成功提升为管理员！');
  console.log('\n📋 管理员账号信息：');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`👤 昵称：${data.nickname}`);
  console.log(`📧 邮箱：${data.email}`);
  console.log(`🔑 密码：使用注册时的密码或"忘记密码"重置`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n🌐 登录后台：https://community.ling-q.tech/admin/dashboard');
}

main();
