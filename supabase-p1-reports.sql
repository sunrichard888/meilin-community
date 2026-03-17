-- 美邻网 P1 阶段 3 - 举报功能数据库
-- 执行于：Supabase SQL Editor

-- 1. 创建举报表
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 举报对象
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  
  -- 举报信息
  reason VARCHAR(50) NOT NULL CHECK (reason IN ('spam', 'harassment', 'hate_speech', 'nsfw', 'other')),
  description TEXT,
  
  -- 举报者
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- 审核状态
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS reports_post_id_idx ON reports(post_id);
CREATE INDEX IF NOT EXISTS reports_reporter_id_idx ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports(status);
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON reports(created_at DESC);

-- 3. RLS 策略
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 用户可以查看自己创建的举报
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- 用户可以创建举报
CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- 管理员可以查看所有举报
CREATE POLICY "Admins can view all reports"
  ON reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- 管理员可以更新举报状态
CREATE POLICY "Admins can update reports"
  ON reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- 4. 创建触发器：防止重复举报
CREATE OR REPLACE FUNCTION prevent_duplicate_report()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM reports
    WHERE reporter_id = NEW.reporter_id
    AND (
      (NEW.post_id IS NOT NULL AND post_id = NEW.post_id) OR
      (NEW.comment_id IS NOT NULL AND comment_id = NEW.comment_id)
    )
    AND reason = NEW.reason
  ) THEN
    RAISE EXCEPTION '您已经举报过此内容';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS before_insert_report_prevent_duplicate ON reports;
CREATE TRIGGER before_insert_report_prevent_duplicate
  BEFORE INSERT ON reports
  FOR EACH ROW
  EXECUTE FUNCTION prevent_duplicate_report();

-- 5. 创建举报计数表（用于 Rate Limiting）
CREATE TABLE IF NOT EXISTS user_post_counts (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  post_count INTEGER DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 6. 创建触发器：更新发帖计数
CREATE OR REPLACE FUNCTION update_user_post_count()
RETURNS TRIGGER AS $$
DECLARE
  current_window TIMESTAMP;
  current_count INTEGER;
BEGIN
  -- 获取当前时间窗口
  SELECT window_start, post_count INTO current_window, current_count
  FROM user_post_counts
  WHERE user_id = NEW.user_id;
  
  -- 如果是新窗口（10 分钟前），重置计数
  IF current_window IS NULL OR current_window < NOW() - INTERVAL '10 minutes' THEN
    INSERT INTO user_post_counts (user_id, post_count, window_start)
    VALUES (NEW.user_id, 1, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      post_count = 1,
      window_start = NOW(),
      updated_at = NOW();
  ELSE
    -- 同一窗口内，增加计数
    UPDATE user_post_counts
    SET post_count = post_count + 1,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    -- 检查是否超过限制（每 10 分钟 3 帖）
    IF (SELECT post_count FROM user_post_counts WHERE user_id = NEW.user_id) > 3 THEN
      RAISE EXCEPTION '发帖频率过高，请 10 分钟后再试';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS before_insert_post_check_rate_limit ON posts;
CREATE TRIGGER before_insert_post_check_rate_limit
  BEFORE INSERT ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_user_post_count();

-- 验证
SELECT '✓ 举报功能和 Rate Limiting 数据库创建成功' as status;
