-- P3 阶段 2: 消息系统
-- 执行于：Supabase SQL Editor

-- ============================================
-- 1. 消息会话表
-- ============================================
CREATE TABLE IF NOT EXISTS message_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  user2_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user1_id, user2_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS message_rooms_user1_idx ON message_rooms(user1_id);
CREATE INDEX IF NOT EXISTS message_rooms_user2_idx ON message_rooms(user2_id);
CREATE INDEX IF NOT EXISTS message_rooms_last_message_idx ON message_rooms(last_message_at DESC);

-- 行级安全策略
ALTER TABLE message_rooms ENABLE ROW LEVEL SECURITY;

-- 删除已有策略（如果存在）
DROP POLICY IF EXISTS "Users can view own rooms" ON message_rooms;
DROP POLICY IF EXISTS "Users can create rooms" ON message_rooms;
DROP POLICY IF EXISTS "Users can update own rooms" ON message_rooms;

-- 策略：用户可以查看自己的会话
CREATE POLICY "Users can view own rooms"
  ON message_rooms FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- 策略：用户可以创建会话
CREATE POLICY "Users can create rooms"
  ON message_rooms FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- 策略：用户可以更新自己的会话
CREATE POLICY "Users can update own rooms"
  ON message_rooms FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- ============================================
-- 2. 消息表增强
-- ============================================

-- 添加 room_id 列（如果不存在）
ALTER TABLE messages ADD COLUMN IF NOT EXISTS room_id UUID REFERENCES message_rooms(id) ON DELETE CASCADE;

-- 添加 read_at 列（如果不存在）
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

-- 添加 created_by 列（如果不存在，兼容旧数据）
ALTER TABLE messages ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);

-- 索引
CREATE INDEX IF NOT EXISTS messages_room_id_idx ON messages(room_id);
CREATE INDEX IF NOT EXISTS messages_created_at_desc_idx ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS messages_room_created_idx ON messages(room_id, created_at DESC);

-- 行级安全策略（已有，更新）
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 删除已有策略（如果存在）
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON messages;

-- 策略：用户可以查看自己会话的消息
CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  USING (
    room_id IN (
      SELECT id FROM message_rooms 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

-- 策略：用户可以发送消息
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    room_id IN (
      SELECT id FROM message_rooms 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

-- 策略：用户可以删除自己的消息
CREATE POLICY "Users can delete own messages"
  ON messages FOR DELETE
  USING (from_user_id = auth.uid());

-- ============================================
-- 3. 触发器：自动更新会话的最后消息时间
-- ============================================
DROP TRIGGER IF EXISTS update_room_last_message ON messages;
DROP FUNCTION IF EXISTS update_message_room_last_message();

CREATE FUNCTION update_message_room_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE message_rooms
  SET last_message_at = NEW.created_at
  WHERE id = NEW.room_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_room_last_message
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION update_message_room_last_message();

-- ============================================
-- 4. 便捷函数：获取或创建会话
-- ============================================
DROP FUNCTION IF EXISTS get_or_create_room(UUID, UUID);

CREATE FUNCTION get_or_create_room(p_user1_id UUID, p_user2_id UUID)
RETURNS UUID AS $$
DECLARE
  v_room_id UUID;
BEGIN
  -- 查找现有会话
  SELECT id INTO v_room_id
  FROM message_rooms
  WHERE (user1_id = p_user1_id AND user2_id = p_user2_id)
     OR (user1_id = p_user2_id AND user2_id = p_user1_id);
  
  -- 如果不存在，创建新会话
  IF v_room_id IS NULL THEN
    INSERT INTO message_rooms (user1_id, user2_id, created_at)
    VALUES (p_user1_id, p_user2_id, NOW())
    RETURNING id INTO v_room_id;
  END IF;
  
  RETURN v_room_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. 便捷函数：获取用户会话列表
-- ============================================
DROP FUNCTION IF EXISTS get_user_rooms(UUID, INTEGER, INTEGER);

CREATE FUNCTION get_user_rooms(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  user1_id UUID,
  user2_id UUID,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  other_user_id UUID,
  other_user_nickname VARCHAR,
  other_user_avatar VARCHAR,
  unread_count BIGINT,
  last_message_content TEXT,
  last_message_from_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mr.id,
    mr.user1_id,
    mr.user2_id,
    mr.last_message_at,
    mr.created_at,
    CASE 
      WHEN mr.user1_id = p_user_id THEN mr.user2_id 
      ELSE mr.user1_id 
    END as other_user_id,
    u.nickname as other_user_nickname,
    u.avatar as other_user_avatar,
    (
      SELECT COUNT(*) 
      FROM messages m 
      WHERE m.room_id = mr.id 
        AND m.from_user_id != p_user_id 
        AND m.read_at IS NULL
    ) as unread_count,
    (
      SELECT m.content 
      FROM messages m 
      WHERE m.room_id = mr.id 
      ORDER BY m.created_at DESC 
      LIMIT 1
    ) as last_message_content,
    (
      SELECT m.from_user_id 
      FROM messages m 
      WHERE m.room_id = mr.id 
      ORDER BY m.created_at DESC 
      LIMIT 1
    ) as last_message_from_id
  FROM message_rooms mr
  LEFT JOIN users u ON u.id = CASE 
    WHEN mr.user1_id = p_user_id THEN mr.user2_id 
    ELSE mr.user1_id 
  END
  WHERE mr.user1_id = p_user_id OR mr.user2_id = p_user_id
  ORDER BY mr.last_message_at DESC NULLS LAST
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. 未读消息计数函数
-- ============================================
DROP FUNCTION IF EXISTS get_user_unread_message_count(UUID);

CREATE FUNCTION get_user_unread_message_count(p_user_id UUID)
RETURNS BIGINT AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM messages m
    JOIN message_rooms mr ON m.room_id = mr.id
    WHERE (mr.user1_id = p_user_id OR mr.user2_id = p_user_id)
      AND m.from_user_id != p_user_id
      AND m.read_at IS NULL
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. 清理和优化
-- ============================================

-- 分析表以优化查询性能
ANALYZE message_rooms;
ANALYZE messages;
