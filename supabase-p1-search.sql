-- 美邻网 P1 功能 - 搜索优化
-- 执行时间：2026-03-19

-- ==================== 1. 为 posts 表添加全文搜索支持 ====================

-- 添加 search_vector 列
ALTER TABLE posts ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 创建 GIN 索引
CREATE INDEX IF NOT EXISTS posts_search_idx ON posts USING GIN(search_vector);

-- 创建触发器：自动更新 search_vector
CREATE OR REPLACE FUNCTION update_posts_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple', COALESCE(NEW.content, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS posts_search_vector_trigger ON posts;
CREATE TRIGGER posts_search_vector_trigger
  BEFORE INSERT OR UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_posts_search_vector();

-- 为现有数据生成 search_vector
UPDATE posts SET search_vector = to_tsvector('simple', COALESCE(content, ''));

-- ==================== 2. 为 neighbor_profiles 添加 search_vector ====================

ALTER TABLE neighbor_profiles ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS neighbor_profiles_search_idx ON neighbor_profiles USING GIN(search_vector);

CREATE OR REPLACE FUNCTION update_neighbor_profiles_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple', 
    COALESCE(NEW.community_name, '') || ' ' || 
    COALESCE(NEW.building_number, '') || ' ' ||
    COALESCE(NEW.introduction, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS neighbor_profiles_search_vector_trigger ON neighbor_profiles;
CREATE TRIGGER neighbor_profiles_search_vector_trigger
  BEFORE INSERT OR UPDATE ON neighbor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_neighbor_profiles_search_vector();

UPDATE neighbor_profiles SET search_vector = to_tsvector('simple', 
  COALESCE(community_name, '') || ' ' || 
  COALESCE(building_number, '') || ' ' ||
  COALESCE(introduction, '')
);

-- ==================== 3. 创建搜索统计视图 ====================

-- 热门搜索统计（基于帖子内容关键词）
CREATE OR REPLACE VIEW search_popular_terms AS
SELECT 
  word,
  COUNT(*) as usage_count
FROM (
  SELECT unnest(regexp_split_to_array(LOWER(content), E'\\s+')) as word
  FROM posts
  WHERE LENGTH(content) > 0
) words
WHERE LENGTH(word) >= 2  -- 过滤掉单个字符
GROUP BY word
ORDER BY usage_count DESC
LIMIT 50;

-- 验证
SELECT '✓ 搜索优化完成' as status;
SELECT '帖子搜索索引：' || COUNT(*) as 统计 FROM posts WHERE search_vector IS NOT NULL;
SELECT '用户资料索引：' || COUNT(*) as 统计 FROM neighbor_profiles WHERE search_vector IS NOT NULL;
