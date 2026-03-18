# P2 阶段 3 开发计划 - 消息通知系统

**时间**: 2026-03-18  
**阶段**: P2 阶段 3 - 消息通知系统  
**状态**: 启动开发

---

## 团队讨论结论

### 已完成的架构决策（ADR）

根据 `docs/ARCHITECTURE.md` 中的决策：

**ADR-001: 通知系统架构**
- 采用**混合方案**：页面可见时使用 Supabase Realtime，后台时切换到 30 秒轮询
- 通知聚合：同一帖子的多个点赞合并为一条
- 通知保留 30 天，过期自动清理

**ADR-002: 关注系统设计** ✅ 已完成
- 单向关注模型
- 关注时自动创建通知（触发器已实现）

**ADR-003: 通知类型设计**
| 类型 | 触发条件 | 聚合策略 |
|------|----------|----------|
| `like` | 有人点赞你的帖子 | 是（同一帖子合并） |
| `comment` | 有人评论你的帖子 | 否（每条评论独立） |
| `follow` | 有人关注你 | 否（每个关注独立） |
| `mention` | 有人在评论中@你 | 否（每条@独立） |
| `system` | 系统通知 | 否 |

---

## 开发任务分解

### 任务 1: 数据库 Schema 完善
**负责人**: Database Specialist  
**状态**: 部分完成（表已创建，需完善索引和触发器）

**待完成**:
- [ ] 通知表已创建（`supabase-p2-follows.sql` 中）
- [ ] 添加通知清理触发器（30 天过期）
- [ ] 添加点赞通知聚合逻辑
- [ ] 添加评论通知触发器

### 任务 2: 通知 API 开发
**负责人**: Lee Robinson (Next.js Engineer)  
**状态**: 待开发

**API 列表**:
- [ ] `GET /api/notifications` - 获取通知列表
- [ ] `POST /api/notifications/read` - 标记为已读
- [ ] `POST /api/notifications/unread` - 标记为未读
- [ ] `DELETE /api/notifications/:id` - 删除通知
- [ ] `GET /api/notifications/unread-count` - 获取未读数

### 任务 3: 通知组件开发
**负责人**: Don Norman (UI/UX Designer)  
**状态**: 待开发

**组件列表**:
- [ ] `NotificationBell` - 通知铃铛图标（带未读计数）
- [ ] `NotificationList` - 通知列表组件
- [ ] `NotificationItem` - 单条通知项
- [ ] `NotificationPanel` - 通知面板（下拉）

### 任务 4: Realtime 集成
**负责人**: Lee Robinson (Next.js Engineer)  
**状态**: 待开发

**实现内容**:
- [ ] Supabase Realtime 订阅
- [ ] 页面可见性检测
- [ ] 轮询降级策略
- [ ] 断线重连逻辑

### 任务 5: 通知设置页面
**负责人**: UI/UX Designer  
**状态**: 待开发

**功能**:
- [ ] 通知开关（点赞、评论、关注、@提及）
- [ ] 推送频率设置（实时、每小时、每天）
- [ ] 清除所有通知

---

## 开发顺序

1. **数据库完善** (15 min)
   - 添加评论通知触发器
   - 添加点赞通知聚合触发器
   - 添加过期清理函数

2. **通知 API** (30 min)
   - 获取通知列表
   - 标记已读/未读
   - 删除通知
   - 未读计数

3. **通知组件** (45 min)
   - 通知铃铛（带计数徽章）
   - 通知列表面板
   - 通知项样式

4. **Realtime 集成** (30 min)
   - Supabase Realtime 订阅
   - 页面可见性检测
   - 轮询降级

5. **集成测试** (15 min)
   - 点赞通知测试
   - 评论通知测试
   - 关注通知测试
   - 已读/未读切换测试

---

## 验收标准

### 功能验收
- [ ] 用户收到点赞通知
- [ ] 用户收到评论通知
- [ ] 用户收到关注通知
- [ ] 通知有未读/已读状态
- [ ] 通知铃铛显示未读计数
- [ ] 点击通知跳转到相关内容
- [ ] 可以删除通知
- [ ] 可以一键清除所有通知

### 性能验收
- [ ] 通知列表加载 < 500ms
- [ ] Realtime 推送延迟 < 2s
- [ ] 轮询间隔合理（30s）
- [ ] 不影响页面整体性能

### UX 验收
- [ ] 通知聚合显示（如"张三等 5 人赞了你的帖子"）
- [ ] 时间显示友好（"5 分钟前"）
- [ ] 空状态设计
- [ ] 移动端适配

---

## 团队成员职责

| 成员 | 角色 | 职责 |
|------|------|------|
| Marty Cagan | Product Manager | 验收通知类型和聚合策略 |
| Richard Bartle | Community SME | 确保通知不会打扰用户 |
| Don Norman | UI/UX Designer | 通知组件设计、空状态、交互细节 |
| Lee Robinson | Next.js Engineer | API 开发、Realtime 集成 |
| Kent Beck | Dev Practice Lead | 代码质量、TDD |
| James Bach | QA Analyst | 测试场景、边界情况 |

---

**下一步**: 开始开发，按照任务顺序依次完成。
