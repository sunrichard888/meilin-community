// 查询管理员用户并创建新管理员
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://tgffujhcruemykdviluw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZ1amhjcnVlbXlrZHZpbHV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU3OTIxNywiZXhwIjoyMDg5MTU1MjE3fQ.jdBirw-9pQXx8YJA65Azq0cPpEOHUYDNJasva0xj0_U'
);

async function main() {
  console.log('=== 美邻网管理员查询工具 ===\n');

  // 1. 查询所有用户
  console.log('📋 当前所有用户：');
  const { data: users, error } = await supabase
    .from('users')
    .select('id, nickname, email, role, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('查询用户失败:', error);
    return;
  }

  if (!users || users.length === 0) {
    console.log('暂无用户数据');
    return;
  }

  users.forEach((user, i) => {
    const roleBadge = user.role === 'admin' ? '👑 管理员' : '👤 普通用户';
    console.log(`${i + 1}. ${user.nickname} (${user.email}) - ${roleBadge}`);
  });

  // 2. 统计管理员数量
  const admins = users.filter(u => u.role === 'admin');
  console.log(`\n📊 管理员总数：${admins.length}`);

  if (admins.length === 0) {
    console.log('⚠️  当前没有管理员用户！');
  } else {
    console.log('\n👑 管理员列表：');
    admins.forEach(admin => {
      console.log(`   - ${admin.nickname} (${admin.email})`);
    });
  }

  // 3. 创建新管理员
  console.log('\n=== 创建新管理员账号 ===');
  
  const newAdminEmail = `admin@meilin${Date.now()}.tech`;
  const newAdminNickname = `管理员${Date.now().toString().slice(-4)}`;
  const tempPassword = `Meilin@${Date.now().toString().slice(-6)}`;

  console.log(`\n📧 邮箱：${newAdminEmail}`);
  console.log(`👤 昵称：${newAdminNickname}`);
  console.log(`🔑 临时密码：${tempPassword}`);
  console.log('\n⚠️  注意：由于 Supabase Auth 限制，需要手动创建用户');
  console.log('请按以下步骤操作：');
  console.log('1. 访问 https://tgffujhcruemykdviluw.supabase.co/dashboard/auth/users');
  console.log('2. 点击 "Add user" → "Create new user"');
  console.log(`3. 填写邮箱：${newAdminEmail}`);
  console.log(`4. 填写密码：${tempPassword}`);
  console.log('5. 创建后，在 SQL Editor 执行以下 SQL 提升为管理员：');
  console.log(`\n   UPDATE users SET role = 'admin' WHERE email = '${newAdminEmail}';`);
}

main();
