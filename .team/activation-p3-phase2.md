# P3 阶段 2 开发计划 - 功能增强和优化

**时间**: 2026-03-18  
**阶段**: P3 阶段 2 - 功能增强和优化  
**状态**: 启动开发

---

## 项目当前状态

### ✅ 已完成功能
| 模块 | 功能 | 状态 |
|------|------|------|
| **用户系统** | 认证/个人设置/个人主页/关注 | ✅ 100% |
| **内容系统** | 帖子发布/评论/点赞/搜索/详情 | ✅ 100% |
| **互动系统** | 消息通知 | ✅ 100% |
| **导航页面** | 发现/集市/活动/消息 | ✅ 80% |

**项目整体完成度：约 90%** 🎊

---

## 待完成功能

### 优先级排序

#### P0 - 高优先级（核心体验）
1. **消息系统完整实现** - 用户私信聊天
2. **数据库 SQL 迁移** - 搜索/通知功能需要执行 SQL

#### P1 - 中优先级（增强体验）
3. **活动系统完整实现** - 发布/报名
4. **集市系统完整实现** - 二手交易
5. **个人资料完善** - 编辑资料/头像裁剪

#### P2 - 低优先级（优化）
6. **性能优化** - Lighthouse 评分 90+
7. **E2E 测试** - Playwright 自动化测试
8. **SEO 优化** - meta 标签/sitemap

---

## 本次开发计划（P3 阶段 2）

### 任务 1: 数据库 SQL 迁移验证 ⚠️
**优先级**: P0  
**工作量**: 5 min（用户执行）

**待执行 SQL**:
1. `supabase-p2-follows.sql` - 关注系统
2. `supabase-p2-notifications.sql` - 通知系统
3. `supabase-p2-search.sql` - 搜索功能

**验收**:
- [ ] 搜索功能正常（能搜到帖子和用户）
- [ ] 通知功能正常（点赞/评论/关注有通知）
- [ ] 关注功能正常

### 任务 2: 消息系统 - 数据库设计
**优先级**: P0  
**工作量**: 20 min

**数据库表**:
```sql
-- 消息会话表
CREATE TABLE message_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID REFERENCES users(id),
  user2_id UUID REFERENCES users(id),
  last_message_at TIMESTAMP,
  created_at TIMESTAMP,
  UNIQUE(user1_id, user2_id)
);

-- 消息表增强
ALTER TABLE messages ADD COLUMN room_id UUID REFERENCES message_rooms(id);
ALTER TABLE messages ADD COLUMN read_at TIMESTAMP;

-- 索引
CREATE INDEX message_rooms_user1_idx ON message_rooms(user1_id);
CREATE INDEX message_rooms_user2_idx ON message_rooms(user2_id);
CREATE INDEX messages_room_id_idx ON messages(room_id);
```

### 任务 3: 消息系统 - API 开发
**优先级**: P0  
**工作量**: 40 min

**API 列表**:
- [ ] `GET /api/messages/rooms` - 获取会话列表
- [ ] `GET /api/messages/rooms/:id` - 获取会话详情
- [ ] `GET /api/messages?room_id=xxx` - 获取消息历史
- [ ] `POST /api/messages` - 发送消息
- [ ] `POST /api/messages/read` - 标记已读
- [ ] `DELETE /api/messages/:id` - 删除消息

### 任务 4: 消息系统 - 前端实现
**优先级**: P0  
**工作量**: 60 min

**组件列表**:
- [ ] `MessageRoomList` - 会话列表
- [ ] `MessageChat` - 聊天窗口
- [ ] `MessageInput` - 消息输入框
- [ ] `MessageItem` - 消息项
- [ ] Realtime 集成（可选）

### 任务 5: 个人资料编辑
**优先级**: P1  
**工作量**: 30 min

**功能**:
- [ ] 编辑昵称
- [ ] 编辑头像（裁剪）
- [ ] 编辑个人简介
- [ ] 绑定手机号（可选）

---

## 开发顺序

### 方案 A: 按优先级（推荐）
1. **验证 SQL 迁移** - 确保现有功能正常
2. **消息系统** - 数据库 → API → 前端
3. **个人资料编辑** - 完善用户系统

### 方案 B: 按依赖关系
1. **数据库设计** - 消息系统
2. **API 开发** - 消息系统
3. **前端实现** - 消息系统
4. **Realtime 集成** - 实时推送

---

## 验收标准

### 消息系统
- [ ] 可以查看会话列表
- [ ] 可以发送消息
- [ ] 可以接收消息
- [ ] 消息有已读/未读状态
- [ ] 未读计数显示正确
- [ ] 点击会话打开聊天窗口

### 个人资料编辑
- [ ] 可以修改昵称
- [ ] 可以修改头像
- [ ] 可以修改个人简介
- [ ] 修改后实时生效

---

## 团队成员职责

| 成员 | 角色 | 职责 |
|------|------|------|
| Marty Cagan | Product Manager | 功能优先级、用户体验 |
| Richard Bartle | Community SME | 消息礼仪规范、隐私边界 |
| Don Norman | UI/UX Designer | 消息 UI、聊天体验 |
| Lee Robinson | Next.js Engineer | API 开发、Realtime 集成 |
| Kent Beck | Dev Practice Lead | 代码质量、TDD |
| James Bach | QA Analyst | 消息测试、边界情况 |

---

**下一步**: 
1. 先验证数据库 SQL 是否已执行
2. 开始消息系统开发
