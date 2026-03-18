-- P2 阶段 2: 用户关注系统
-- 执行于：Supabase SQL Editor

-- 关注表
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL, -- 关注者
  followee_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL, -- 被关注者
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(follower_id, followee_id) -- 防止重复关注
);

-- 索引
CREATE INDEX IF NOT EXISTS follows_follower_idx ON follows(follower_id);
CREATE INDEX IF NOT EXISTS follows_followee_idx ON follows(followee_id);

-- 行级安全策略
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- 删除已有策略（如果存在）
DROP POLICY IF EXISTS "Follows are viewable by everyone" ON follows;
DROP POLICY IF EXISTS "Users can insert own follows" ON follows;
DROP POLICY IF EXISTS "Users can delete own follows" ON follows;

-- 策略：所有人可查看关注关系
CREATE POLICY "Follows are viewable by everyone"
  ON follows FOR SELECT
  USING (true);

-- 策略：用户只能关注他人（不能代别人关注）
CREATE POLICY "Users can insert own follows"
  ON follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- 策略：用户只能取消自己的关注
CREATE POLICY "Users can delete own follows"
  ON follows FOR DELETE
  USING (auth.uid() = follower_id);

-- 通知表
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL, -- 接收通知的用户
  type VARCHAR(50) NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention', 'system')),
  actor_id UUID REFERENCES users(id) ON DELETE CASCADE, -- 触发通知的用户
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE, -- 相关帖子
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- 相关评论
  content TEXT, -- 通知内容（可选，用于聚合）
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 索引
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_user_read_idx ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at DESC);

-- 行级安全策略
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 删除已有策略（如果存在）
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications for others" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;

-- 策略：用户只能查看自己的通知
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- 策略：系统可以创建通知（使用 Service Role Key）
CREATE POLICY "Users can insert notifications for others"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- 策略：用户只能标记自己的通知为已读
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- 策略：用户只能删除自己的通知
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- 触发器：关注时自动创建通知
DROP TRIGGER IF EXISTS notify_on_follow ON follows;
DROP FUNCTION IF EXISTS create_follow_notification();

CREATE FUNCTION create_follow_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- 创建关注通知
  INSERT INTO notifications (user_id, type, actor_id)
  VALUES (NEW.followee_id, 'follow', NEW.follower_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_on_follow
AFTER INSERT ON follows
FOR EACH ROW EXECUTE FUNCTION create_follow_notification();

-- 添加用户统计字段（可选，用于缓存计数）
ALTER TABLE users ADD COLUMN IF NOT EXISTS follows_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;

-- 触发器：更新关注计数
DROP TRIGGER IF EXISTS update_follows_count ON follows;
DROP FUNCTION IF EXISTS update_users_follows_count();

CREATE FUNCTION update_users_follows_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- 被关注者的粉丝数 +1
    UPDATE users SET followers_count = followers_count + 1 WHERE id = NEW.followee_id;
    -- 关注者的关注数 +1
    UPDATE users SET follows_count = follows_count + 1 WHERE id = NEW.follower_id;
  ELSIF TG_OP = 'DELETE' THEN
    -- 被关注者的粉丝数 -1
    UPDATE users SET followers_count = followers_count - 1 WHERE id = OLD.followee_id;
    -- 关注者的关注数 -1
    UPDATE users SET follows_count = follows_count - 1 WHERE id = OLD.follower_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_follows_count
AFTER INSERT OR DELETE ON follows
FOR EACH ROW EXECUTE FUNCTION update_users_follows_count();

-- 初始化现有用户的计数（如果有数据）
UPDATE users u SET 
  follows_count = (SELECT COUNT(*) FROM follows f WHERE f.follower_id = u.id),
  followers_count = (SELECT COUNT(*) FROM follows f WHERE f.followee_id = u.id);
