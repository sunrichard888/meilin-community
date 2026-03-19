-- 美邻网 P3 功能 - Posts 表添加分类字段
-- 执行时间：2026-03-19

-- 1. 为 posts 表添加 category 字段
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS category TEXT;

-- 2. 创建索引（优化分类查询性能）
CREATE INDEX IF NOT EXISTS posts_category_idx ON posts(category);

-- 3. 添加分类约束注释
COMMENT ON COLUMN posts.category IS '帖子分类：emergency(紧急通知), marketplace(二手闲置), help(邻里互助), event(社区活动), pets(宠物交友), food(美食分享)';

-- 4. 更新现有帖子（可选：根据内容关键词自动分类）
-- 注意：这个 UPDATE 仅用于迁移已有数据，新帖子由前端传入 category

-- 紧急通知
UPDATE posts SET category = 'emergency' 
WHERE category IS NULL 
  AND (content LIKE '%通知%' OR content LIKE '%紧急%' OR content LIKE '%公告%');

-- 二手闲置
UPDATE posts SET category = 'marketplace' 
WHERE category IS NULL 
  AND (content LIKE '%闲置%' OR content LIKE '%转让%' OR content LIKE '%出售%' OR content LIKE '%二手%');

-- 邻里互助
UPDATE posts SET category = 'help' 
WHERE category IS NULL 
  AND (content LIKE '%互助%' OR content LIKE '%求助%' OR content LIKE '%帮忙%' OR content LIKE '%拼车%');

-- 社区活动
UPDATE posts SET category = 'event' 
WHERE category IS NULL 
  AND (content LIKE '%活动%' OR content LIKE '%报名%' OR content LIKE '%聚会%' OR content LIKE '%美食节%');

-- 宠物交友
UPDATE posts SET category = 'pets' 
WHERE category IS NULL 
  AND (content LIKE '%宠物%' OR content LIKE '%狗%' OR content LIKE '%猫%' OR content LIKE '%交友%');

-- 美食分享
UPDATE posts SET category = 'food' 
WHERE category IS NULL 
  AND (content LIKE '%美食%' OR content LIKE '%食谱%' OR content LIKE '%做菜%' OR content LIKE '%餐厅%');

-- 5. 验证
SELECT '✓ Posts 表分类字段添加成功' as status;

-- 查询分类统计（验证用）
SELECT category, COUNT(*) as count 
FROM posts 
WHERE category IS NOT NULL 
GROUP BY category 
ORDER BY count DESC;
