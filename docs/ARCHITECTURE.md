# Architecture Decision Records (ADRs) — 美邻网

This document records architectural decisions for the Meilin Community Network project.

---

## ADR-001: 通知系统架构

**日期**: 2026-03-18  
**状态**: 已决定  
**决策者**: 全体团队

### 问题

如何设计通知系统以平衡实时性、性能和复杂度？

### 选项分析

#### 选项 1: Supabase Realtime 实时推送
**优点**:
- 真正的实时体验
- 用户无需刷新即可看到新通知
- 技术栈统一（使用 Supabase）

**缺点**:
- 增加连接开销
- 移动端电池消耗
- 需要处理断线重连

#### 选项 2: 定时轮询
**优点**:
- 实现简单
- 客户端控制频率
- 无长连接开销

**缺点**:
- 通知延迟
- 无效请求浪费
- 用户体验较差

#### 选项 3: 混合方案（推荐）
**优点**:
- 页面活动时使用 Realtime
- 后台时降低频率或暂停
- 平衡体验和性能

**缺点**:
- 实现复杂度稍高

### 决策

采用**选项 3: 混合方案**

**具体实现**:
1. 页面可见时使用 Supabase Realtime 订阅
2. 页面隐藏时切换到 30 秒轮询
3. 通知聚合：同一帖子的多个点赞合并为一条
4. 通知保留 30 天，过期自动清理

### 实施细节

```typescript
// 通知表结构
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type VARCHAR(50) NOT NULL, -- 'like', 'comment', 'follow', 'mention'
  actor_id UUID REFERENCES users(id), -- 触发用户
  post_id UUID REFERENCES posts(id), -- 相关帖子
  comment_id UUID REFERENCES comments(id), -- 相关评论
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP
);

// 索引
CREATE INDEX notifications_user_id_idx ON notifications(user_id);
CREATE INDEX notifications_user_read_idx ON notifications(user_id, read);
```

---

## ADR-002: 关注系统设计

**日期**: 2026-03-18  
**状态**: 已决定  
**决策者**: 全体团队

### 问题

如何设计关注功能以促进社区连接？

### 决策

**关注模型**: 单向关注（类似 Twitter/微博）

**理由**:
- 降低社交压力（不需要互相关注）
- 符合内容消费习惯
- 实现简单，易于扩展

**业务规则**:
1. 关注关系公开（可查看关注列表和粉丝列表）
2. 不限制关注数量
3. 支持取消关注
4. 不显示粉丝数（避免社交压力，符合邻里社区定位）

### 数据模型

```typescript
// 关注表
CREATE TABLE follows (
  id UUID PRIMARY KEY,
  follower_id UUID REFERENCES users(id), -- 关注者
  followee_id UUID REFERENCES users(id), -- 被关注者
  created_at TIMESTAMP,
  UNIQUE(follower_id, followee_id) -- 防止重复关注
);

// 索引
CREATE INDEX follows_follower_idx ON follows(follower_id);
CREATE INDEX follows_followee_idx ON follows(followee_id);
```

### API 设计

```
GET    /api/follows?user_id=xxx      # 获取用户关注列表
GET    /api/follows/followers?user_id=xxx  # 获取用户粉丝列表
POST   /api/follows                  # 关注用户
DELETE /api/follows?user_id=xxx      # 取消关注
GET    /api/follows/check?user_id=xxx # 检查是否已关注
```

---

## ADR-003: 通知类型设计

**日期**: 2026-03-18  
**状态**: 已决定  
**决策者**: 全体团队

### 通知类型

| 类型 | 触发条件 | 聚合策略 |
|------|----------|----------|
| `like` | 有人点赞你的帖子 | 是（同一帖子合并） |
| `comment` | 有人评论你的帖子 | 否（每条评论独立） |
| `follow` | 有人关注你 | 否（每个关注独立） |
| `mention` | 有人在评论中@你 | 否（每条@独立） |
| `system` | 系统通知（举报处理等） | 否 |

### 通知聚合规则

**点赞通知聚合**:
- 同一帖子在 1 小时内的多个点赞合并为一条
- 显示为 "张三 等 5 人 赞了你的帖子"
- 点击可查看详情列表

### 推送策略

**实时性分级**:
1. **高优先级**（实时推送）: 评论、@提及
2. **中优先级**（1 分钟内）: 点赞、关注
3. **低优先级**（轮询）: 系统通知

---

## ADR-004: 个人主页设计

**日期**: 2026-03-18  
**状态**: 已决定  
**决策者**: 全体团队

### 页面结构

```
/users/[userId]
├── 用户信息卡片（头像、昵称、加入时间）
├── 统计信息（帖子数、关注数、粉丝数）
├── 操作按钮（关注/取消关注、私信）
├── Tab 切换
│   ├── TA 的帖子
│   └── TA 的评论（可选，考虑隐私）
```

### 隐私考虑

1. 所有用户可查看他人主页
2. 仅显示公开帖子
3. 评论显示可选（默认开启，用户可关闭）

---

## 技术债务与 Deferred Items

详见 `docs/deferred-items.md`

---

## 参考文档

- [Supabase Realtime 文档](https://supabase.com/docs/guides/realtime)
- [Next.js App Router 最佳实践](https://nextjs.org/docs/app)
- [通知系统设计模式](https://aws.amazon.com/cn/builders-library/notification-systems/)
