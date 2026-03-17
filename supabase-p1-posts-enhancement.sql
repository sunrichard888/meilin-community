-- 美邻网 P1 功能 - Posts 表增强和 RLS 策略
-- 执行于：Supabase SQL Editor

-- 1. 为 posts 表添加小区/楼栋字段（用于过滤）
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS community_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS building_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;

-- 2. 创建索引（优化查询性能）
CREATE INDEX IF NOT EXISTS posts_community_name_idx ON posts(community_name);
CREATE INDEX IF NOT EXISTS posts_building_number_idx ON posts(building_number);
CREATE INDEX IF NOT EXISTS posts_is_pinned_idx ON posts(is_pinned);

-- 3. 创建触发器：发帖时自动填充小区/楼栋信息
CREATE OR REPLACE FUNCTION populate_post_community_info()
RETURNS TRIGGER AS $$
BEGIN
  -- 从 neighbor_profiles 获取用户的小区信息
  SELECT community_name, building_number
  INTO NEW.community_name, NEW.building_number
  FROM neighbor_profiles
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS before_insert_post_populate_community ON posts;
CREATE TRIGGER before_insert_post_populate_community
  BEFORE INSERT ON posts
  FOR EACH ROW
  EXECUTE FUNCTION populate_post_community_info();

-- 4. RLS 策略
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 允许所有人查看已发布的帖子
CREATE POLICY "Anyone can view posts"
  ON posts FOR SELECT
  USING (true);

-- 登录用户可以创建帖子
CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的帖子
CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id);

-- 用户只能删除自己的帖子
CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);

-- 5. 更新 posts 表注释
COMMENT ON TABLE posts IS '社区帖子表';
COMMENT ON COLUMN posts.community_name IS '用户所属小区（自动填充）';
COMMENT ON COLUMN posts.building_number IS '用户楼栋号（自动填充）';
COMMENT ON COLUMN posts.is_pinned IS '是否置顶';

-- 验证
SELECT '✓ Posts 表增强和 RLS 策略创建成功' as status;
