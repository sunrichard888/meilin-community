-- Supabase 连接诊断脚本
-- 在 Supabase SQL Editor 执行

-- 1. 检查表是否存在
SELECT table_name, 
       CASE WHEN table_name = 'users' THEN '✓' ELSE '✗' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'posts', 'comments', 'likes', 'messages')
ORDER BY table_name;

-- 2. 检查 RLS 是否启用
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('users', 'posts', 'comments', 'likes', 'messages');

-- 3. 检查 RLS 策略数量
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename;

-- 4. 检查匿名用户是否有 SELECT 权限
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'anon'
AND table_name IN ('users', 'posts');

-- 5. 测试查询 posts 表（应该返回空或数据）
SELECT COUNT(*) as post_count FROM posts;

-- 6. 检查数据库版本和扩展
SELECT version() as postgres_version;
SELECT extname, extversion FROM pg_extension WHERE extname = 'uuid-ossp';
