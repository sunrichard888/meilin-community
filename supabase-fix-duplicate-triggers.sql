-- 美邻网 - 清理重复触发器
-- 在 Supabase SQL Editor 执行此脚本

-- 删除重复的触发器（保留一个）
DROP TRIGGER IF EXISTS posts_likes_count_trigger ON likes;
DROP TRIGGER IF EXISTS posts_comments_count_trigger ON comments;

-- 重新创建触发器（确保只有一个）
CREATE TRIGGER posts_likes_count_trigger
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

CREATE TRIGGER posts_comments_count_trigger
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- 验证：每个触发器应该只有 1 条记录
SELECT trigger_name, event_object_table, COUNT(*) as count
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name IN ('posts_likes_count_trigger', 'posts_comments_count_trigger')
GROUP BY trigger_name, event_object_table;
