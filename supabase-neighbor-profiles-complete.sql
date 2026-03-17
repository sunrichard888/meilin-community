-- 美邻网 - 邻里认证表（完整版）
-- 执行于：Supabase SQL Editor

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建邻里认证表
CREATE TABLE IF NOT EXISTS neighbor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
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

-- 创建触发器：自动更新 updated_at（使用不同的函数名避免冲突）
CREATE OR REPLACE FUNCTION update_neighbor_profiles_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_neighbor_profiles_updated_at
  BEFORE UPDATE ON neighbor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_neighbor_profiles_updated_at_column();

-- 验证：显示创建的表
SELECT '✓ neighbor_profiles 表创建成功' as status;
