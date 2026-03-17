-- 美邻网 - 邻里认证表
-- 执行于：2026-03-16
-- 说明：存储用户小区认证信息

-- 创建邻里认证表
CREATE TABLE IF NOT EXISTS neighbor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- 小区认证
  community_name VARCHAR(200) NOT NULL,        -- 小区名称
  
  -- 楼栋信息
  building_number VARCHAR(20) NOT NULL,        -- 楼栋号
  unit_number VARCHAR(10) NOT NULL,            -- 单元号
  room_number VARCHAR(10) NOT NULL,            -- 房号
  
  -- 自我介绍
  introduction TEXT,                           -- 个人介绍
  
  -- 认证状态
  verification_status VARCHAR(20) DEFAULT 'pending' 
    CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_rejected_reason TEXT,           -- 拒绝原因
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 创建索引
CREATE INDEX IF NOT EXISTS neighbor_profiles_user_id_idx ON neighbor_profiles(user_id);
CREATE INDEX IF NOT EXISTS neighbor_profiles_community_name_idx ON neighbor_profiles(community_name);
CREATE INDEX IF NOT EXISTS neighbor_profiles_verification_status_idx ON neighbor_profiles(verification_status);

-- RLS 策略
ALTER TABLE neighbor_profiles ENABLE ROW LEVEL SECURITY;

-- 用户可查看自己的完整信息
CREATE POLICY "Users can view own profile"
  ON neighbor_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- 用户可创建自己的信息
CREATE POLICY "Users can insert own profile"
  ON neighbor_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户可更新自己的信息
CREATE POLICY "Users can update own profile"
  ON neighbor_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- 管理员可查看所有信息
CREATE POLICY "Admins can view all profiles"
  ON neighbor_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- 验证：显示创建的表和策略
SELECT '✓ neighbor_profiles 表创建成功' as status;
