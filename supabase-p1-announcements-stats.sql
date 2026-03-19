-- 美邻网 P1 功能 - 公告表和社区统计优化
-- 执行时间：2026-03-19

-- ==================== 1. 创建公告表 ====================

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'notice' CHECK (category IN ('notice', 'event', 'safety', 'other')),
  is_pinned BOOLEAN DEFAULT FALSE,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 创建索引
CREATE INDEX IF NOT EXISTS announcements_category_idx ON announcements(category);
CREATE INDEX IF NOT EXISTS announcements_is_pinned_idx ON announcements(is_pinned);
CREATE INDEX IF NOT EXISTS announcements_created_at_idx ON announcements(created_at DESC);

-- 启用 RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- 公告策略：所有人可查看，仅管理员可写
DROP POLICY IF EXISTS "Anyone can view announcements" ON announcements;
DROP POLICY IF EXISTS "Admins can create announcements" ON announcements;
DROP POLICY IF EXISTS "Admins can update announcements" ON announcements;
DROP POLICY IF EXISTS "Admins can delete announcements" ON announcements;

CREATE POLICY "Anyone can view announcements"
  ON announcements FOR SELECT
  USING (true);

CREATE POLICY "Admins can create announcements"
  ON announcements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update announcements"
  ON announcements FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete announcements"
  ON announcements FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 自动更新 updated_at 触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_announcements_updated_at ON announcements;
CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==================== 2. 插入测试公告数据 ====================

INSERT INTO announcements (title, content, category, is_pinned, author_id, created_at)
SELECT 
  '🎉 美邻网上线公告',
  '亲爱的邻居们，美邻网社区平台正式上线啦！我们致力于打造一个温馨和谐的邻里交流平台，让大家能够更好地互帮互助、分享生活。欢迎加入！',
  'notice',
  true,
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
  NOW() - INTERVAL '4 days'
WHERE NOT EXISTS (SELECT 1 FROM announcements WHERE title = '🎉 美邻网上线公告');

INSERT INTO announcements (title, content, category, is_pinned, author_id, created_at)
SELECT 
  '📋 社区规范发布',
  '为了维护良好的社区秩序，我们制定了以下社区规范：1. 文明发言，友善交流；2. 禁止发布广告和虚假信息；3. 尊重他人隐私；4. 遇到问题及时举报。请大家共同遵守！',
  'notice',
  true,
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
  NOW() - INTERVAL '3 days'
WHERE NOT EXISTS (SELECT 1 FROM announcements WHERE title = '📋 社区规范发布');

INSERT INTO announcements (title, content, category, is_pinned, author_id, created_at)
SELECT 
  '🏘️ 小区活动征集',
  '为丰富社区文化生活，现向全体居民征集社区活动创意。无论是亲子活动、运动比赛、还是兴趣小组，都欢迎提出宝贵建议！',
  'event',
  false,
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
  NOW() - INTERVAL '2 days'
WHERE NOT EXISTS (SELECT 1 FROM announcements WHERE title = '🏘️ 小区活动征集');

INSERT INTO announcements (title, content, category, is_pinned, author_id, created_at)
SELECT 
  '🔒 安全提示：谨防电信诈骗',
  '近期电信诈骗案件频发，请大家提高警惕：1. 不轻信陌生电话；2. 不随意点击不明链接；3. 不向陌生账户转账；4. 遇到可疑情况及时报警。',
  'safety',
  false,
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
  NOW() - INTERVAL '1 day'
WHERE NOT EXISTS (SELECT 1 FROM announcements WHERE title = '🔒 安全提示：谨防电信诈骗');

-- ==================== 3. 创建统计视图 ====================

-- 用户统计视图
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 day') as new_users_today,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_users_this_week,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_this_month
FROM users;

-- 帖子统计视图
CREATE OR REPLACE VIEW post_stats AS
SELECT 
  COUNT(*) as total_posts,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 day') as posts_today,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as posts_this_week,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as posts_this_month,
  SUM(likes_count) as total_likes,
  SUM(comments_count) as total_comments
FROM posts;

-- 小区统计视图
CREATE OR REPLACE VIEW community_stats_view AS
SELECT 
  community_name,
  COUNT(DISTINCT user_id) as user_count,
  COUNT(*) as post_count,
  SUM(likes_count) as total_likes
FROM posts
WHERE community_name IS NOT NULL
GROUP BY community_name
ORDER BY post_count DESC
LIMIT 10;

-- 活跃用户统计视图
CREATE OR REPLACE VIEW active_user_stats AS
SELECT 
  u.id,
  u.nickname,
  u.avatar,
  COUNT(DISTINCT p.id) as post_count,
  COALESCE(SUM(p.likes_count), 0) as total_likes_received,
  COUNT(DISTINCT c.id) as comment_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
LEFT JOIN comments c ON u.id = c.user_id
GROUP BY u.id, u.nickname, u.avatar
ORDER BY post_count DESC, total_likes_received DESC
LIMIT 10;

-- 分类统计
CREATE OR REPLACE VIEW category_stats AS
SELECT 
  category,
  COUNT(*) as post_count,
  SUM(likes_count) as total_likes,
  SUM(comments_count) as total_comments
FROM posts
WHERE category IS NOT NULL
GROUP BY category
ORDER BY post_count DESC;

-- 验证视图创建
SELECT '✓ 统计视图创建成功' as status;

-- ==================== 4. 验证数据 ====================

SELECT '公告总数：' || COUNT(*) as 统计 FROM announcements;
SELECT '用户统计视图：' || total_users as 统计 FROM user_stats;
SELECT '帖子统计视图：' || total_posts as 统计 FROM post_stats;

SELECT '✅ P1 数据库迁移完成！' as 状态;
