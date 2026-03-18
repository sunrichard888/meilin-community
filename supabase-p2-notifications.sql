-- P2 阶段 3: 消息通知系统增强
-- 执行于：Supabase SQL Editor

-- 注意：notifications 表已在 supabase-p2-follows.sql 中创建
-- 本文件添加额外的触发器和函数

-- ============================================
-- 1. 评论通知触发器
-- ============================================
DROP TRIGGER IF EXISTS notify_on_comment ON comments;
DROP FUNCTION IF EXISTS create_comment_notification();

CREATE FUNCTION create_comment_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- 获取帖子作者
  SELECT user_id INTO NEW.user_id FROM posts WHERE id = NEW.post_id;
  
  -- 如果是回复自己的帖子，创建通知
  INSERT INTO notifications (user_id, type, actor_id, post_id, comment_id)
  SELECT 
    p.user_id, -- 帖子作者
    'comment',
    NEW.user_id, -- 评论者
    NEW.post_id,
    NEW.id
  FROM posts p
  WHERE p.id = NEW.post_id
    AND p.user_id != NEW.user_id; -- 不通知自己
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_on_comment
AFTER INSERT ON comments
FOR EACH ROW EXECUTE FUNCTION create_comment_notification();

-- ============================================
-- 2. 点赞通知聚合触发器
-- ============================================
DROP TRIGGER IF EXISTS aggregate_like_notification ON likes;
DROP FUNCTION IF EXISTS create_or_update_like_notification();

CREATE FUNCTION create_or_update_like_notification()
RETURNS TRIGGER AS $$
DECLARE
  existing_notification_id UUID;
BEGIN
  -- 查找是否已有同一帖子的点赞通知（1 小时内）
  SELECT id INTO existing_notification_id
  FROM notifications
  WHERE user_id = (SELECT user_id FROM posts WHERE id = NEW.post_id)
    AND type = 'like'
    AND post_id = NEW.post_id
    AND actor_id != NEW.user_id -- 不是同一个人
    AND created_at > NOW() - INTERVAL '1 hour'
  LIMIT 1;
  
  IF existing_notification_id IS NULL THEN
    -- 创建新通知
    INSERT INTO notifications (user_id, type, actor_id, post_id)
    SELECT 
      p.user_id, -- 帖子作者
      'like',
      NEW.user_id, -- 点赞者
      NEW.post_id
    FROM posts p
    WHERE p.id = NEW.post_id
      AND p.user_id != NEW.user_id; -- 不通知自己
  ELSE
    -- 更新现有通知的 actor_id 为最新点赞者（用于显示"张三等 X 人"）
    UPDATE notifications
    SET actor_id = NEW.user_id
    WHERE id = existing_notification_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER aggregate_like_notification
AFTER INSERT ON likes
FOR EACH ROW EXECUTE FUNCTION create_or_update_like_notification();

-- ============================================
-- 3. 通知过期清理（30 天）
-- ============================================
DROP FUNCTION IF EXISTS cleanup_old_notifications();

CREATE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- 创建定时任务（需要 pg_cron 扩展）
-- 如果没有 pg_cron，可以手动调用或通过应用层定时调用
-- SELECT cron.schedule('cleanup-notifications', '0 2 * * *', 'SELECT cleanup_old_notifications()');

-- ============================================
-- 4. 通知计数优化（使用简单查询，不用物化视图）
-- ============================================
-- 物化视图在触发器中刷新有问题，改用直接查询方式
-- 性能优化可以通过添加索引实现

-- 确保未读状态索引存在
CREATE INDEX IF NOT EXISTS notifications_user_read_idx ON notifications(user_id, read);

-- ============================================
-- 5. 用户已读所有通知的便捷函数
-- ============================================
DROP FUNCTION IF EXISTS mark_all_notifications_read(UUID);

CREATE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE notifications
  SET read = TRUE
  WHERE user_id = p_user_id AND read = FALSE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. 获取用户通知列表（带聚合信息）
-- ============================================
DROP FUNCTION IF EXISTS get_user_notifications(UUID, INTEGER, INTEGER);

CREATE FUNCTION get_user_notifications(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  type VARCHAR,
  actor_id UUID,
  actor_nickname VARCHAR,
  actor_avatar VARCHAR,
  post_id UUID,
  comment_id UUID,
  content TEXT,
  read BOOLEAN,
  created_at TIMESTAMP,
  like_count BIGINT -- 聚合的点赞数
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.type,
    n.actor_id,
    u.nickname as actor_nickname,
    u.avatar as actor_avatar,
    n.post_id,
    n.comment_id,
    n.content,
    n.read,
    n.created_at,
    COALESCE(lc.like_count, 1) as like_count
  FROM notifications n
  LEFT JOIN users u ON u.id = n.actor_id
  LEFT JOIN (
    -- 统计 1 小时内同一帖子的点赞数
    SELECT 
      n2.post_id,
      COUNT(*) as like_count
    FROM notifications n2
    WHERE n2.type = 'like'
      AND n2.created_at > NOW() - INTERVAL '1 hour'
    GROUP BY n2.post_id
  ) lc ON lc.post_id = n.post_id
  WHERE n.user_id = p_user_id
  ORDER BY n.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. 清理函数（手动调用）
-- ============================================
-- 定期清理过期通知（可以通过 cron 或应用层定时调用）
-- SELECT cleanup_old_notifications();
