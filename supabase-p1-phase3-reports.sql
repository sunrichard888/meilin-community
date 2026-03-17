-- =====================================================
-- 美邻网 P1 阶段 3: 举报功能数据库迁移
-- =====================================================

-- 1. 创建举报表
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'inappropriate', 'harassment', 'fraud', 'other')),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  
  -- 确保同一用户不能重复举报同一帖子
  UNIQUE(post_id, reporter_id)
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS reports_post_id_idx ON reports(post_id);
CREATE INDEX IF NOT EXISTS reports_reporter_id_idx ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports(status);
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON reports(created_at);

-- 3. 创建自动更新 updated_at 的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4. 创建 RLS 策略
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的举报
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- 用户可以创建举报
CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- 管理员可以查看所有举报（通过角色判断）
-- 注意：需要先在 users 表中添加 is_admin 字段
-- 这里假设管理员通过 JWT claims 或单独的管理员表识别
CREATE POLICY "Admins can view all reports"
  ON reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
    )
  );

-- 管理员可以更新举报状态
CREATE POLICY "Admins can update reports"
  ON reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
    )
  );

-- 5. 创建举报计数触发器（可选：在 posts 表添加 reports_count）
-- 如果需要在 posts 表显示举报数量，可以添加以下字段和触发器
-- ALTER TABLE posts ADD COLUMN IF NOT EXISTS reports_count INTEGER DEFAULT 0;

-- 6. 创建管理员视图（方便后台查询）
CREATE OR REPLACE VIEW admin_reports_view AS
SELECT 
  r.id,
  r.post_id,
  r.reason,
  r.description,
  r.status,
  r.admin_notes,
  r.created_at,
  r.updated_at,
  r.resolved_at,
  reporter.nickname as reporter_nickname,
  post_user.nickname as post_author_nickname,
  p.content as post_content,
  p.created_at as post_created_at
FROM reports r
JOIN posts p ON r.post_id = p.id
JOIN users reporter ON r.reporter_id = reporter.id
JOIN users post_user ON p.user_id = post_user.id
ORDER BY r.created_at DESC;

-- =====================================================
-- 迁移完成
-- =====================================================
