-- 美邻网 - 隐私设置表
-- 执行于：2026-03-17
-- 说明：存储用户隐私设置

-- 创建隐私设置表
CREATE TABLE IF NOT EXISTS user_privacy_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- 个人信息可见性
  show_community_name BOOLEAN DEFAULT true,       -- 是否显示小区名称
  show_building_info BOOLEAN DEFAULT false,       -- 是否显示楼栋信息（默认隐藏）
  show_introduction BOOLEAN DEFAULT true,         -- 是否显示自我介绍
  show_nickname BOOLEAN DEFAULT true,             -- 是否显示昵称
  
  -- 交互权限
  allow_direct_messages BOOLEAN DEFAULT true,     -- 允许私信
  allow_comments BOOLEAN DEFAULT true,            -- 允许评论
  allow_mentions BOOLEAN DEFAULT true,            -- 允许被@
  
  -- 通知设置
  notify_new_comments BOOLEAN DEFAULT true,
  notify_new_likes BOOLEAN DEFAULT true,
  notify_new_followers BOOLEAN DEFAULT true,
  notify_community_updates BOOLEAN DEFAULT true,
  
  -- 隐私级别预设
  privacy_preset VARCHAR(20) DEFAULT 'custom'
    CHECK (privacy_preset IN ('public', 'neighbors_only', 'private', 'custom')),
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 创建索引
CREATE INDEX IF NOT EXISTS user_privacy_settings_user_id_idx ON user_privacy_settings(user_id);

-- RLS 策略
ALTER TABLE user_privacy_settings ENABLE ROW LEVEL SECURITY;

-- 用户可查看自己的设置
CREATE POLICY "Users can view own privacy settings"
  ON user_privacy_settings FOR SELECT
  USING (auth.uid() = user_id);

-- 用户可创建自己的设置
CREATE POLICY "Users can insert own privacy settings"
  ON user_privacy_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户可更新自己的设置
CREATE POLICY "Users can update own privacy settings"
  ON user_privacy_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- 管理员可查看所有设置
CREATE POLICY "Admins can view all privacy settings"
  ON user_privacy_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- 创建触发器：自动更新 updated_at
DROP TRIGGER IF EXISTS update_user_privacy_settings_updated_at ON user_privacy_settings;
DROP FUNCTION IF EXISTS update_updated_at_column();

CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_privacy_settings_updated_at
  BEFORE UPDATE ON user_privacy_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 验证：显示创建的表和策略
SELECT '✓ user_privacy_settings 表创建成功' as status;
