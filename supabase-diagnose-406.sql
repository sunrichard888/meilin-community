-- 美邻网 - 诊断 406 错误
-- 在 Supabase Dashboard → SQL Editor 执行

-- 1. 检查 users 表 RLS 状态
SELECT tablename, rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';

-- 2. 检查所有 RLS 策略
SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'users'
ORDER BY cmd;

-- 3. 测试：匿名用户能否查询
-- 这个查询会模拟匿名访问
SET LOCAL ROLE anon;
SELECT COUNT(*) FROM users;
RESET ROLE;

-- 4. 检查 auth 用户
SELECT COUNT(*) as auth_users FROM auth.users;

-- 5. 显示诊断结果
SELECT '如果以上有错误，请截图发给开发团队' as note;
