# P3 阶段 1 开发计划 - 导航页面完善

**时间**: 2026-03-18  
**阶段**: P3 阶段 1 - 完善顶部导航页面  
**状态**: 启动开发

---

## 项目当前状态

### ✅ 已完成功能（P1 + P2）
| 功能模块 | 状态 | 完成度 |
|------|------|------|
| 用户认证 | ✅ 完成 | 100% |
| 个人设置 | ✅ 完成 | 100% |
| 邻里认证 | ✅ 完成 | 100% |
| 隐私设置 | ✅ 完成 | 100% |
| 帖子发布 | ✅ 完成 | 100% |
| 帖子列表 | ✅ 完成 | 100% |
| 评论功能 | ✅ 完成 | 100% |
| 点赞功能 | ✅ 完成 | 100% |
| 用户关注 | ✅ 完成 | 100% |
| 个人主页 | ✅ 完成 | 100% |
| 消息通知 | ✅ 完成 | 100% |
| 全局搜索 | ✅ 完成 | 100% |
| 帖子详情 | ✅ 完成 | 100% |

**P1 + P2 完成度：100%** 🎊

---

## 待完善导航页面

### 1. 🧭 发现页面 (`/discover`)
**优先级**: 高  
**工作量**: 中等

**功能定位**: 内容发现和推荐
- 热门帖子（按点赞/评论排序）
- 最新帖子（实时动态）
- 置顶公告
- 小区动态
- 优质内容推荐

**页面结构**:
```
/discover
├── Tab 切换
│   ├── 热门
│   ├── 最新
│   └── 精选
├── 帖子列表（瀑布流或列表）
└── 无限滚动加载
```

### 2. 🎉 活动页面 (`/activities`)
**优先级**: 中  
**工作量**: 大

**功能定位**: 社区活动发布和报名
- 活动列表
- 活动详情
- 在线报名
- 活动日历
- 我的活动

**页面结构**:
```
/activities
├── 活动列表
│   ├── 进行中
│   ├── 即将开始
│   └── 已结束
├── 发布活动（管理员）
└── 活动详情
    ├── 活动信息
    ├── 报名列表
    └── 报名入口
```

**数据库表**:
```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY,
  title VARCHAR(200),
  description TEXT,
  location VARCHAR(200),
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  max_participants INTEGER,
  organizer_id UUID REFERENCES users(id),
  status VARCHAR(20), -- 'upcoming', 'ongoing', 'ended'
  created_at TIMESTAMP
);

CREATE TABLE activity_participants (
  id UUID PRIMARY KEY,
  activity_id UUID REFERENCES activities(id),
  user_id UUID REFERENCES users(id),
  status VARCHAR(20), -- 'pending', 'confirmed', 'cancelled'
  created_at TIMESTAMP
);
```

### 3. 🏪 集市页面 (`/market`)
**优先级**: 中  
**工作量**: 中等

**功能定位**: 邻里二手交易和物品分享
- 物品列表
- 物品详情
- 发布物品
- 物品分类
- 联系卖家

**页面结构**:
```
/market
├── 分类筛选
│   ├── 全部
│   ├── 出售
│   ├── 求购
│   └── 免费
├── 物品列表（卡片式）
└── 发布物品
    ├── 物品信息
    ├── 图片上传
    └── 联系方式
```

**数据库表**:
```sql
CREATE TABLE market_items (
  id UUID PRIMARY KEY,
  title VARCHAR(200),
  description TEXT,
  category VARCHAR(50), -- 'sell', 'buy', 'free'
  price DECIMAL,
  images TEXT[],
  seller_id UUID REFERENCES users(id),
  contact_info VARCHAR(200),
  status VARCHAR(20), -- 'available', 'sold', 'reserved'
  created_at TIMESTAMP
);
```

### 4. 💬 消息页面 (`/messages`)
**优先级**: 高  
**工作量**: 大

**功能定位**: 用户间私信聊天
- 消息列表
- 聊天窗口
- 未读计数
- 消息通知

**页面结构**:
```
/messages
├── 左侧：会话列表
│   ├── 未读计数
│   └── 最近消息
└── 右侧：聊天窗口
    ├── 消息历史
    └── 输入框
```

**数据库表**:
```sql
-- messages 表已存在，需要增强
ALTER TABLE messages ADD COLUMN room_id UUID;
ALTER TABLE messages ADD COLUMN read_at TIMESTAMP;

-- 消息会话表
CREATE TABLE message_rooms (
  id UUID PRIMARY KEY,
  user1_id UUID REFERENCES users(id),
  user2_id UUID REFERENCES users(id),
  last_message_at TIMESTAMP,
  created_at TIMESTAMP
);
```

---

## 开发顺序建议

### 方案 A: 按优先级
1. **发现页面** (1-2 小时) - 高优先级，快速上线
2. **消息页面** (4-6 小时) - 高优先级，复杂度高
3. **集市页面** (2-3 小时) - 中优先级
4. **活动页面** (6-8 小时) - 中优先级，复杂度高

### 方案 B: 按复杂度递增
1. **发现页面** (简单) - 建立信心
2. **集市页面** (中等) - 练习 CRUD
3. **消息页面** (困难) - Realtime 集成
4. **活动页面** (困难) - 完整业务流

### 方案 C: MVP 方式（推荐）
**第一批次** (今天):
- 发现页面（静态数据）
- 集市页面（静态数据）
- 活动页面（占位符）
- 消息页面（占位符）

**第二批次** (后续):
- 消息系统完整实现
- 活动系统完整实现
- 数据集成和 API

---

## 本次开发计划（MVP 方式）

### 任务 1: 发现页面
**负责人**: Lee Robinson (Next.js Engineer)  
**工作量**: 45 min

**实现内容**:
- [ ] 热门帖子 API（按 likes_count 排序）
- [ ] 发现页面 UI
- [ ] Tab 切换（热门/最新/精选）
- [ ] 集成到导航栏

### 任务 2: 集市页面
**负责人**: Software Engineer  
**工作量**: 45 min

**实现内容**:
- [ ] 集市页面 UI（占位符）
- [ ] 物品分类筛选
- [ ] 发布物品入口（占位符）

### 任务 3: 活动页面
**负责人**: Software Engineer  
**工作量**: 30 min

**实现内容**:
- [ ] 活动页面 UI（占位符）
- [ ] 活动列表（空状态）
- [ ] 发布活动入口（管理员）

### 任务 4: 消息页面
**负责人**: Software Engineer  
**工作量**: 45 min

**实现内容**:
- [ ] 消息页面 UI（占位符）
- [ ] 会话列表（空状态）
- [ ] 聊天窗口（占位符）

---

## 验收标准

### 发现页面
- [ ] 显示热门帖子（按点赞排序）
- [ ] 显示最新帖子（按时间排序）
- [ ] Tab 切换正常
- [ ] 点击帖子跳转到详情页

### 集市页面
- [ ] 显示物品列表（可占位）
- [ ] 分类筛选正常
- [ ] 发布入口可见

### 活动页面
- [ ] 显示活动列表（可占位）
- [ ] 活动状态标签（进行中/即将开始/已结束）
- [ ] 发布入口（管理员可见）

### 消息页面
- [ ] 显示会话列表（可占位）
- [ ] 未读计数显示
- [ ] 聊天窗口布局

---

## 团队成员职责

| 成员 | 角色 | 职责 |
|------|------|------|
| Marty Cagan | Product Manager | 页面定位、功能优先级 |
| Richard Bartle | Community SME | 社区互动设计、活动类型 |
| Don Norman | UI/UX Designer | 页面布局、空状态设计 |
| Lee Robinson | Next.js Engineer | API 开发、页面实现 |
| Kent Beck | Dev Practice Lead | 代码质量、小步迭代 |
| James Bach | QA Analyst | 页面测试、边界情况 |

---

**下一步**: 开始开发，先完成发现页面（优先级最高）。
