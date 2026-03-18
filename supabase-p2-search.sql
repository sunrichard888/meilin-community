-- P2 阶段 4: 全局搜索功能
-- 执行于：Supabase SQL Editor

-- ============================================
-- 1. 帖子全文搜索索引
-- ============================================

-- 添加搜索向量列
ALTER TABLE posts ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 创建触发器自动更新搜索向量
DROP TRIGGER IF EXISTS posts_search_vector_update ON posts;

CREATE OR REPLACE FUNCTION posts_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('simple', coalesce(NEW.content, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.community_name, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.building_number, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_search_vector_update
  BEFORE INSERT OR UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION posts_search_vector_update();

-- 为现有数据创建搜索向量
UPDATE posts SET search_vector = 
  setweight(to_tsvector('simple', coalesce(content, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(community_name, '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(building_number, '')), 'C');

-- 创建 GIN 索引
CREATE INDEX IF NOT EXISTS posts_search_vector_idx ON posts USING GIN(search_vector);

-- ============================================
-- 2. 用户搜索索引
-- ============================================

-- 添加搜索向量列
ALTER TABLE users ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 创建触发器自动更新搜索向量
DROP TRIGGER IF EXISTS users_search_vector_update ON users;

CREATE OR REPLACE FUNCTION users_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('simple', coalesce(NEW.nickname, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.email, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_search_vector_update
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION users_search_vector_update();

-- 为现有数据创建搜索向量
UPDATE users SET search_vector = 
  setweight(to_tsvector('simple', coalesce(nickname, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(email, '')), 'C');

-- 创建 GIN 索引
CREATE INDEX IF NOT EXISTS users_search_vector_idx ON users USING GIN(search_vector);

-- ============================================
-- 3. 搜索函数 - 搜索帖子
-- ============================================
DROP FUNCTION IF EXISTS search_posts(TEXT, INTEGER, INTEGER, TEXT, TEXT);

CREATE OR REPLACE FUNCTION search_posts(
  search_query TEXT,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_community_name TEXT DEFAULT NULL,
  p_user_id TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  content TEXT,
  images TEXT[],
  likes_count INTEGER,
  comments_count INTEGER,
  community_name VARCHAR,
  building_number VARCHAR,
  is_pinned BOOLEAN,
  created_at TIMESTAMPTZ,
  user_nickname VARCHAR,
  user_avatar VARCHAR,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.content,
    p.images,
    p.likes_count,
    p.comments_count,
    p.community_name,
    p.building_number,
    p.is_pinned,
    p.created_at,
    u.nickname as user_nickname,
    u.avatar as user_avatar,
    ts_rank(p.search_vector, plainto_tsquery('simple', search_query)) as rank
  FROM posts p
  LEFT JOIN users u ON u.id = p.user_id
  WHERE p.search_vector @@ plainto_tsquery('simple', search_query)
    AND (p_community_name IS NULL OR p.community_name = p_community_name)
    AND (p_user_id IS NULL OR p.user_id::TEXT = p_user_id)
  ORDER BY 
    p.is_pinned DESC,
    rank DESC,
    p.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. 搜索函数 - 搜索用户
-- ============================================
DROP FUNCTION IF EXISTS search_users(TEXT, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION search_users(
  search_query TEXT,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  nickname VARCHAR,
  avatar VARCHAR,
  created_at TIMESTAMPTZ,
  follows_count INTEGER,
  followers_count INTEGER,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.nickname,
    u.avatar,
    u.created_at,
    u.follows_count,
    u.followers_count,
    ts_rank(u.search_vector, plainto_tsquery('simple', search_query)) as rank
  FROM users u
  WHERE u.search_vector @@ plainto_tsquery('simple', search_query)
  ORDER BY rank DESC, u.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. 搜索建议函数
-- ============================================
DROP FUNCTION IF EXISTS get_search_suggestions(TEXT, INTEGER);

CREATE OR REPLACE FUNCTION get_search_suggestions(
  search_query TEXT,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  type TEXT,
  id UUID,
  text TEXT,
  extra_info TEXT
) AS $$
BEGIN
  -- 帖子建议
  RETURN QUERY
  SELECT 
    'post'::TEXT as type,
    p.id,
    left(p.content, 50) as text,
    u.nickname as extra_info
  FROM posts p
  LEFT JOIN users u ON u.id = p.user_id
  WHERE p.search_vector @@ plainto_tsquery('simple', search_query)
  LIMIT p_limit;
  
  -- 用户建议
  RETURN QUERY
  SELECT 
    'user'::TEXT as type,
    u.id,
    u.nickname as text,
    '' as extra_info
  FROM users u
  WHERE u.search_vector @@ plainto_tsquery('simple', search_query)
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. 清理和优化
-- ============================================

-- 分析表以优化查询性能
ANALYZE posts;
ANALYZE users;

-- 添加常用查询索引
CREATE INDEX IF NOT EXISTS posts_created_at_desc_idx ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS posts_community_name_idx ON posts(community_name);
CREATE INDEX IF NOT EXISTS users_nickname_idx ON users(nickname);
