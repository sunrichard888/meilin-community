-- 美邻网 - 修复 users 表 INSERT 策略
-- 在 Supabase Dashboard → SQL Editor 执行此脚本

-- ============================================
-- 步骤 1：检查当前策略状态
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'users'
ORDER BY cmd, policyname;

-- ============================================
-- 步骤 2：添加 INSERT 策略
-- ============================================

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;

-- 创建新策略 - 允许 authenticated 用户和 service role 插入
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (
    -- Service Role 绕过此检查（auth.uid() 为 NULL）
    -- Authenticated 用户只能插入自己的记录
    auth.uid() IS NULL OR auth.uid() = id
  );

-- ============================================
-- 步骤 3：验证策略已创建
-- ============================================
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'users' 
ORDER BY cmd;

-- ============================================
-- 步骤 4：测试插入（可选）
-- ============================================
-- 注意：这只在 SQL Editor 中使用 service_role 时有效
-- DO $$
-- BEGIN
--   INSERT INTO users (id, email, nickname, role)
--   VALUES (uuid_generate_v4(), 'rls-test@example.com', 'RLS Test', 'user');
--   RAISE NOTICE '✓ INSERT test passed';
-- EXCEPTION WHEN OTHERS THEN
--   RAISE NOTICE '✗ INSERT test failed: %', SQLERRM;
-- END $$;
