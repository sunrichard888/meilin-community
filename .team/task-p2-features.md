# P2 功能增强 - 任务清单

## 目标
完成美邻网 P2 级别的 3 个核心功能，提升用户互动体验。

---

## 功能 1: 通知系统

**文件**: `src/app/notifications/page.tsx`, `/api/notifications`

**现状**: 已有基础表结构

**需求**:
- [ ] 实时通知列表（评论/点赞/关注/系统通知）
- [ ] 未读数量标记
- [ ] 一键已读功能
- [ ] 通知类型图标区分
- [ ] 点击跳转到相关内容

**技术实现**:
- 轮询或实时订阅（Supabase Realtime）
- 通知类型：comment, like, follow, system
- 已读/未读状态管理

---

## 功能 2: 私信功能

**文件**: `src/app/messages/page.tsx`, `/api/messages`

**现状**: 已有 messages 表

**需求**:
- [ ] 消息列表（按会话分组）
- [ ] 私信对话页面
- [ ] 发送消息
- [ ] 已读/未读状态
- [ ] 在线状态显示（可选）

**技术实现**:
- 消息会话列表 API
- 发送/接收消息
- 按时间排序
- 未读消息计数

---

## 功能 3: 图片上传优化

**文件**: `src/components/image-uploader.tsx`

**现状**: 基础上传功能

**需求**:
- [ ] 集成 Supabase Storage
- [ ] 图片压缩
- [ ] 上传进度显示
- [ ] 拖拽上传
- [ ] 多图预览

**技术实现**:
- Supabase Storage bucket
- 客户端图片压缩
- 上传进度条
- 拖拽 API

---

## 实施顺序

1. **通知系统** - 最简单，基于现有表
2. **私信功能** - 中等复杂度
3. **图片上传** - 需要配置 Storage

---

## 数据库迁移

### 1. 通知表增强
```sql
-- 已有 notifications 表，添加索引
CREATE INDEX notifications_user_id_read_idx ON notifications(user_id, read);
```

### 2. 消息表增强
```sql
-- 添加会话 ID 便于分组
ALTER TABLE messages ADD COLUMN IF NOT EXISTS conversation_id TEXT;
CREATE INDEX messages_conversation_idx ON messages(conversation_id);
```

---

## 验收标准

- [ ] 通知实时推送
- [ ] 私信正常收发
- [ ] 图片上传稳定
- [ ] 移动端响应式正常
- [ ] TypeScript 编译通过
- [ ] 构建成功

---

*创建时间：2026-03-19*
