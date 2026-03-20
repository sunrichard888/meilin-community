-- 美邻网 - 创建管理员账号
-- 执行方式：在 Supabase Dashboard → SQL Editor 中执行此 SQL
-- 执行时间：2026-03-20

-- ==================== 方案 1：提升现有用户为管理员 ====================
-- 如果想把现有用户提升为管理员，执行下面这条（修改邮箱）：
-- UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';

-- ==================== 方案 2：创建新的管理员账号 ====================
-- 注意：Supabase Auth 用户需要通过 Dashboard 或 API 创建
-- 以下是手动步骤：

-- 步骤 1: 访问 https://tgffujhcruemykdviluw.supabase.co/dashboard/auth/users
-- 步骤 2: 点击 "Add user" → "Create new user"
-- 步骤 3: 填写以下信息：
--   邮箱：admin@meilin.tech
--   密码：Meilin2026!@#
-- 步骤 4: 创建后，执行下面的 SQL 提升为管理员：

UPDATE users SET role = 'admin' WHERE email = 'admin@meilin.tech';

-- 如果上面 SQL 影响行数为 0，说明用户还没创建，先创建用户再执行

-- ==================== 验证管理员 ====================
-- 执行后验证：
SELECT id, nickname, email, role FROM users WHERE role = 'admin';
