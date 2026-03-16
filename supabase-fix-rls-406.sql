-- 美邻网 - 修复 users 表 RLS 策略（406 错误修复）
-- 在 Supabase Dashboard → SQL Editor 执行此脚本

-- ============================================
-- 步骤 1：验证当前状态
-- ============================================

-- 检查表是否存在
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'users';

-- 检查 RLS 是否启用
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';

-- 检查现有策略
SELECT policyname, cmd, roles FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'users';

-- ============================================
-- 步骤 2：修复 RLS 策略
-- ============================================

-- 启用 RLS（如果未启用）
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 删除旧策略（清理重复）
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users can view users" ON users;
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- 创建完整的 RLS 策略

-- 1. SELECT 策略 - 允许所有人查看用户资料（公开社区）
CREATE POLICY "Public profiles are viewable by everyone"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- 2. SELECT 策略 - 允许匿名访问（用于未登录用户浏览）
CREATE POLICY "Public read access"
  ON users FOR SELECT
  TO anon
  USING (true);

-- 3. INSERT 策略 - 允许用户创建自己的资料
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id OR auth.uid() IS NULL);

-- 4. UPDATE 策略 - 允许用户更新自己的资料
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- 步骤 3：验证修复
-- ============================================

-- 查看所有策略
SELECT policyname, cmd, roles, qual 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'users'
ORDER BY cmd, policyname;

-- 测试查询
SELECT COUNT(*) as user_count FROM users;

-- 显示成功消息
SELECT '✓ RLS 策略修复完成！' as status;
