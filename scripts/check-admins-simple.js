const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://tgffujhcruemykdviluw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZ1amhjcnVlbXlrZHZpbHV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU3OTIxNywiZXhwIjoyMDg5MTU1MjE3fQ.jdBirw-9pQXx8YJA65Azq0cPpEOHUYDNJasva0xj0_U'
);

async function main() {
  console.log('=== 美邻网管理员查询 ===\n');

  const { data: users, error } = await supabase
    .from('users')
    .select('id, nickname, email, role, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ 查询失败:', error.message);
    return;
  }

  if (!users || users.length === 0) {
    console.log('📭 暂无用户数据');
    return;
  }

  console.log('📋 所有用户：');
  users.forEach((u, i) => {
    const badge = u.role === 'admin' ? '👑' : '👤';
    console.log(`${i+1}. ${badge} ${u.nickname} (${u.email}) - ${u.role}`);
  });

  const admins = users.filter(u => u.role === 'admin');
  console.log(`\n👑 管理员数量：${admins.length}`);
  admins.forEach(a => console.log(`   - ${a.nickname} (${a.email})`));
}

main();
