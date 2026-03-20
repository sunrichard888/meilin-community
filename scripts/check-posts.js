const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://tgffujhcruemykdviluw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZ1amhjcnVlbXlrZHZpbHV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU3OTIxNywiZXhwIjoyMDg5MTU1MjE3fQ.jdBirw-9pQXx8YJA65Azq0cPpEOHUYDNJasva0xj0_U'
);

async function main() {
  console.log('=== 检查帖子数据 ===\n');

  // 检查帖子总数
  const { count: totalPosts } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 帖子总数：${totalPosts || 0}`);

  // 检查分类分布
  const { data: categories } = await supabase
    .from('posts')
    .select('category')
    .not('category', 'is', null);

  const categoryCount = {};
  (categories || []).forEach(post => {
    categoryCount[post.category] = (categoryCount[post.category] || 0) + 1;
  });

  console.log('\n📂 分类分布：');
  Object.entries(categoryCount).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count} 帖`);
  });

  // 检查热门帖子 API
  console.log('\n🔥 检查热门帖子...');
  const { data: hotPosts } = await supabase
    .from('posts')
    .select('id, content, category, likes_count, comments_count')
    .order('likes_count', { ascending: false })
    .limit(5);

  if (hotPosts && hotPosts.length > 0) {
    console.log('前 5 热门帖子：');
    hotPosts.forEach((post, i) => {
      console.log(`${i+1}. ${post.content.slice(0, 30)}... (❤️${post.likes_count}, 💬${post.comments_count})`);
    });
  } else {
    console.log('⚠️  暂无帖子数据');
  }
}

main();
