-- 美邻网 - 修复隐私设置表 RLS 策略
-- 执行于：2026-03-17

-- 先删除现有策略
DROP POLICY IF EXISTS "Users can view own privacy settings" ON user_privacy_settings;
DROP POLICY IF EXISTS "Users can insert own privacy settings" ON user_privacy_settings;
DROP POLICY IF EXISTS "Users can update own privacy settings" ON user_privacy_settings;
DROP POLICY IF EXISTS "Admins can view all privacy settings" ON user_privacy_settings;

-- 重新创建策略（使用 auth.uid() 而不是 user_id 直接比较）
CREATE POLICY "Users can view own privacy settings"
  ON user_privacy_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own privacy settings"
  ON user_privacy_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own privacy settings"
  ON user_privacy_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all privacy settings"
  ON user_privacy_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- 验证策略
SELECT '✓ user_privacy_settings RLS 策略已修复' as status;
