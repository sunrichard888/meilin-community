# 美邻网项目日记

**项目名称**: 美邻网 (Meilin Community)  
**项目地址**: https://github.com/sunrichard888/meilin-community  
**部署地址**: https://community.ling-q.tech  
**技术栈**: Next.js 16.1.6 + Supabase + Vercel  
**记录时间**: 2026-03-17 23:09

---

## 📊 项目概况

美邻网是一个基于 Next.js + Supabase 的社区邻里平台，旨在连接小区居民，提供邻里认证、隐私设置、帖子发布、社区互动等功能。

### 核心功能
- ✅ 用户认证（注册/登录/修改密码）
- ✅ 个人设置（昵称/头像）
- ✅ 邻里认证（小区/楼栋/单元/房号）
- ✅ 隐私设置（可见性/交互权限/通知设置）
- ✅ 帖子发布（文字 + 表情 + 图片）
- ✅ 帖子列表（真实数据 + 小区过滤）
- ✅ **评论功能**（评论列表/发布/删除）
- ✅ **点赞功能**（点赞/取消/实时计数）
- 🔄 举报功能（待部署）
- 🔄 Rate Limiting（待部署）

---

## 📅 开发时间线

### 第一阶段：基础架构（2026-03-16 完成）

| 功能 | 状态 | 说明 |
|------|------|------|
| 用户认证 | ✅ 完成 | 邮箱密码注册/登录 |
| 修改密码 | ✅ 完成 | 支持密码修改 |
| 个人设置 | ✅ 完成 | 昵称/头像修改 |
| Vercel 部署 | ✅ 完成 | 新加坡节点部署 |

### 第二阶段：邻里功能（2026-03-17 完成）

| 功能 | 状态 | 说明 |
|------|------|------|
| 邻里认证页面 | ✅ 完成 | 小区/楼栋/单元/房号 |
| 邻里认证 API | ✅ 完成 | 验证 + 数据库操作 |
| 隐私设置页面 | ✅ 完成 | 4 个预设 + 自定义 |
| 隐私设置 API | ✅ 完成 | 增删改查 |
| 数据库表 | ✅ 完成 | 7 张表全部创建 |

### 第三阶段：P1 功能开发（2026-03-17 完成）

#### 阶段 1：基础架构
| 功能 | 状态 | 说明 |
|------|------|------|
| Server Actions | ✅ 完成 | createPost/getPosts/deletePost/toggleLike |
| 测试框架 | ✅ 完成 | Vitest + 10 个测试用例 |
| 数据库增强 | ✅ 完成 | posts 表 + RLS 策略 + 触发器 |

#### 阶段 2：组件开发
| 功能 | 状态 | 说明 |
|------|------|------|
| Feed 页面 | ✅ 完成 | Server Component + 骨架屏 |
| PostComposer | ✅ 完成 | 发布组件 + Ctrl+Enter |
| PostList | ✅ 完成 | 列表组件 + 小区过滤 |
| PostCard | ✅ 完成 | 卡片组件 + 时间显示 |
| EmojiPicker | ✅ 完成 | 表情选择器（10 分类 200+ 表情） |

#### 阶段 3：优化和审核
| 功能 | 状态 | 说明 |
|------|------|------|
| 举报功能 | ✅ 完成 | 举报按钮 + API + 管理员后台 |
| Rate Limiting | ✅ 完成 | 每 10 分钟≤3 帖 + 友好提示 |
| 性能优化 | ✅ 完成 | ISR 缓存 + 图片懒加载 |
| 可访问性 | ✅ 完成 | 键盘导航 + ARIA 标签 |

---

## 🔧 遇到的问题与解决方案

### 问题 1: Vercel 构建失败 - npm install 卡死
**时间**: 2026-03-17 11:45  
**错误**: `npm error Exit handler never called!`  
**原因**: npm 在 Vercel 环境 bug + 腾讯云镜像无法访问  
**解决**: 切换到 yarn + 重新生成 yarn.lock  
**结果**: ✅ 构建成功

### 问题 2: 隐私设置 API 返回 401
**时间**: 2026-03-17 14:28  
**错误**: `POST /api/privacy-settings 401 (Unauthorized)`  
**原因**: Cookie 不自动同步 + 未传递 Authorization header  
**解决**: getToken() + Authorization header  
**结果**: ✅ 认证通过

### 问题 3: RLS 策略阻止插入 - 42501 错误
**时间**: 2026-03-17 15:32  
**错误**: `new row violates row-level security policy`  
**原因**: API 使用 anon key 时 auth.uid() 无法获取用户  
**解决**: 使用 Service Role Key 绕过 RLS  
**结果**: ✅ 数据插入成功

### 问题 4: neighbor_profiles 表不存在 - PGRST205
**时间**: 2026-03-17 16:57  
**错误**: `Could not find the table 'public.neighbor_profiles'`  
**原因**: 数据库表未创建  
**解决**: 执行 SQL 创建表 + 索引 + 触发器  
**结果**: ✅ 表创建成功

### 问题 5: Invalid Server Actions request
**时间**: 2026-03-17 21:58  
**错误**: `Error: Invalid Server Actions request`  
**原因**: Next.js 16 不能直接从客户端调用 Server Actions  
**解决**: 改用 FormData + API 路由方式  
**结果**: ✅ 发帖功能正常

### 问题 6: Git push 网络超时
**时间**: 多次出现  
**错误**: `GnuTLS recv error (-110): The TLS connection was non-properly terminated`  
**原因**: 服务器到 GitHub 网络不稳定  
**解决**: 配置 Git 超时 + 手动推送  
**结果**: ⚠️ 需要手动推送

### 问题 7: AvatarEditor 中 useRef 使用错误
**时间**: 2026-03-18 10:33  
**错误**: 点击"更换头像"按钮无响应  
**原因**: 使用 `useState` 存储 ref 而非 `useRef`  
**解决**: 改用 `useRef` hook  
**结果**: ✅ 头像上传功能正常

---

## 📅 P2 开发进度（2026-03-18）

---

## 📁 数据库表结构

### 已创建表（9 张）

| 表名 | 说明 | 状态 |
|------|------|------|
| `users` | 用户信息 | ✅ |
| `posts` | 动态帖子 | ✅ |
| `comments` | 评论 | ✅ |
| `messages` | 私信 | ✅ |
| `likes` | 点赞 | ✅ |
| `neighbor_profiles` | 邻里认证 | ✅ |
| `user_privacy_settings` | 隐私设置 | ✅ |
| `reports` | 举报记录 | ✅ |
| `user_post_counts` | 发帖计数（Rate Limiting） | ✅ |

### posts 表结构
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  images TEXT[],
  community_name VARCHAR(200),  -- 自动填充
  building_number VARCHAR(20),  -- 自动填充
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### reports 表结构
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES posts(id),
  reason VARCHAR(50) CHECK (reason IN ('spam', 'harassment', 'hate_speech', 'nsfw', 'other')),
  reporter_id UUID REFERENCES auth.users(id),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP
);
```

---

## 🎯 Ensemble 团队贡献

### 团队成员
| 成员 | 角色 | 贡献 |
|------|------|------|
| Marty Cagan | 产品专家 | MVP 范围、优先级、种子内容策略 |
| Don Norman | UI/UX 设计师 | 44px 触摸目标、骨架屏、可访问性 |
| Richard Bartle | 社区设计专家 | 分级认证、举报流程、反 Spam |
| James Bach | QA 分析师 | 测试策略、边界情况、Rate Limiting |
| Lee Robinson | Next.js 专家 | Server Actions、ISR 缓存、图片优化 |
| Kent Beck | TDD 专家 | 测试框架、小步迭代、代码质量 |

### P1 实施成果
- **阶段 1**: Server Actions + 测试框架（2 天）
- **阶段 2**: Feed 组件（发布/列表/卡片/表情）（2 天）
- **阶段 3**: 举报 + Rate Limiting + 性能优化（1 天）

---

## 📈 当前状态

### 已完成功能
- ✅ 用户认证系统
- ✅ 隐私设置（4 个预设 + 自定义）
- ✅ 邻里认证（小区/楼栋/单元/房号）
- ✅ 帖子发布（文字 + 表情 + 图片占位）
- ✅ 帖子列表（真实数据 + 小区过滤）
- ✅ 数据库表（9 张）
- ✅ Vercel 自动部署

### 待部署功能
- 🔄 举报功能（需执行 SQL）
- 🔄 Rate Limiting（需执行 SQL）
- 🔄 管理员后台（/admin/reports）

### 待开发功能（P2 剩余）
- 🔄 用户关注
- 🔄 消息通知
- 🔄 个人主页
- 🔄 搜索功能

### 待优化项
- 🔄 补充 E2E 测试
- 🔄 Onboarding 流程设计
- 🔄 空状态设计优化
- 🔄 性能监控（Lighthouse）

---

## 🔑 关键教训

### 1. Next.js App Router 认证
**教训**: Cookie 在客户端和 API 之间不自动同步  
**最佳实践**:
```typescript
// 前端
const token = await getToken();
fetch('/api/xxx', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// API
const authHeader = request.headers.get('authorization');
const { user } = await supabase.auth.getUser(token);
```

### 2. Supabase RLS 策略
**教训**: API 使用 anon key 时 auth.uid() 无法获取用户  
**最佳实践**:
```typescript
// 先用 anon key 验证
const { user } = await authClient.auth.getUser(token);

// 再用 service role key 操作数据库
const supabase = createClient(URL, SERVICE_ROLE_KEY);
```

### 3. Server Actions 调用
**教训**: Next.js 16 不能直接从客户端调用 Server Actions  
**最佳实践**:
```typescript
// 使用 FormData + API 路由
const formData = new FormData();
formData.append('content', content);
fetch('/api/posts', { method: 'POST', body: formData });
```

### 4. Vercel 部署
**教训**: 国内 npm 镜像 Vercel 无法访问  
**最佳实践**:
- 移除全局 `.npmrc` 镜像配置
- 使用 `yarn` 替代 `npm`
- 在 Vercel 添加 `SUPABASE_SERVICE_ROLE_KEY`

### 5. 表情符号支持
**教训**: PostgreSQL 默认支持 UTF-8，无需特殊配置  
**最佳实践**:
- 使用 `TEXT` 类型存储内容
- 前端添加表情选择器提升体验
- 确保字符计数正确（表情算 1 个字符）

---

## 📚 参考文档

- [Next.js 文档](https://nextjs.org/docs)
- [Supabase 文档](https://supabase.com/docs)
- [Vercel 部署指南](https://vercel.com/docs)
- [Ensemble Team Skill](https://github.com/openclaw/openclaw/tree/main/skills/ensemble-team)

---

## 🎯 下一步计划

### 立即执行
1. **推送代码** - 手动 `git push origin master`
2. **执行 SQL** - `supabase-p1-phase3-reports.sql`
3. **验证功能** - 发帖 + 表情 + 举报

### P2 规划
1. **图片上传** - 接入腾讯云 COS
2. **评论功能** - 完整评论系统
3. **消息通知** - 实时通知推送
4. **数据分析** - 用户行为追踪

---

**最后更新**: 2026-03-18 11:10  
**P1 完成度**: 100% ✅  
**P2 进度**: 图片上传 + 评论 + 点赞功能完成 ✅  
**下次更新**: 待用户关注/消息通知功能完成后

---

## 📅 P2 开发进度（2026-03-18）

### P2-1: 图片上传功能（✅ 完成）

#### 实现内容
| 功能 | 状态 | 说明 |
|------|------|------|
| Supabase Storage | ✅ 完成 | 创建 post-images bucket |
| 图片上传组件 | ✅ 完成 | 支持多选/预览/删除 |
| 图片压缩 | ✅ 完成 | 自动压缩到 1920px + 80% 质量 |
| 上传进度 | ✅ 完成 | 实时显示上传百分比 |
| 限制控制 | ✅ 完成 | 最多 3 张，单张≤2MB |

#### 数据库变更
```sql
-- 创建 Storage Bucket
Storage: post-images
路径格式：{user_id}/{timestamp}-{random}.jpg
公开访问：enabled
```

#### 遇到的问题
| 问题 | 解决方案 |
|------|----------|
| 图片大小超限 | 前端压缩 + 后端验证 |
| 上传失败无提示 | 添加 try-catch + toast 提示 |
| 文件名冲突 | 时间戳 + 随机字符串 |

#### 最新提交
- `c0639bc` - feat: 图片控件图标优化 + 帖子图片点击放大
- `d69431c` - fix: 图片控件与表情控件水平布局
- `7cde60a` - feat(P2): 实现图片上传功能（Supabase Storage）

### UI/UX 优化（✅ 完成）

#### 图片控件布局优化
- **问题**: 图片控件和表情控件上下布局，占用空间大
- **解决**: 改为水平布局，同一行显示
- **效果**: 更紧凑，与表情控件对齐

#### 图片图标优化
- **变更前**: 📷 相机图标
- **变更后**: 🖼️ 图片图标（更符合图片上传场景）

#### 图片点击放大功能
- **新增组件**: `image-lightbox.tsx`
- **功能**:
  - 点击帖子图片全屏查看
  - ESC 键或点击背景关闭
  - 加载动画
  - 图片自适应屏幕
  - 键盘导航支持

### P2-2: 评论和点赞功能（✅ 完成）

#### 实现内容
| 功能 | 状态 | 说明 |
|------|------|------|
| 评论 API | ✅ 完成 | GET/POST/DELETE |
| 评论组件 | ✅ 完成 | 列表/发布/删除 |
| 点赞 API | ✅ 完成 | POST 切换状态 |
| 点赞组件 | ✅ 完成 | 实时状态同步 |
| 数据库触发器 | ✅ 已有 | 自动更新计数 |

#### 技术实现
**评论功能**:
- Server Actions: `getComments`, `createComment`, `deleteComment`
- API 路由：`/api/comments`
- 组件：`CommentsSection`
- 支持 500 字限制
- 仅作者可删除评论

**点赞功能**:
- Server Actions: `toggleLike`（已存在）
- API 路由：`/api/likes`
- 组件：`LikeButton`
- 实时状态同步
- 防止重复点赞（数据库唯一约束）

#### 数据库结构
```sql
-- comments 表
CREATE TABLE comments (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES posts(id),
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP
);

-- likes 表
CREATE TABLE likes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  post_id UUID REFERENCES posts(id),
  created_at TIMESTAMP,
  UNIQUE(user_id, post_id)  -- 防止重复点赞
);

-- 触发器：自动更新计数
CREATE TRIGGER posts_comments_count_trigger 
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

CREATE TRIGGER posts_likes_count_trigger 
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();
```

#### 最新提交
- `16658b8` - feat: 实现评论和点赞功能

#### 实现内容
| 功能 | 状态 | 说明 |
|------|------|------|
| Supabase Storage | ✅ 完成 | 创建 post-images bucket |
| 图片上传组件 | ✅ 完成 | 支持多选/预览/删除 |
| 图片压缩 | ✅ 完成 | 自动压缩到 1920px + 80% 质量 |
| 上传进度 | ✅ 完成 | 实时显示上传百分比 |
| 限制控制 | ✅ 完成 | 最多 3 张，单张≤2MB |

#### 数据库变更
```sql
-- 创建 Storage Bucket
Storage: post-images
路径格式：{user_id}/{timestamp}-{random}.jpg
公开访问： enabled
```

#### 遇到的问题
| 问题 | 解决方案 |
|------|----------|
| 图片大小超限 | 前端压缩 + 后端验证 |
| 上传失败无提示 | 添加 try-catch + toast 提示 |
| 文件名冲突 | 时间戳 + 随机字符串 |

#### 最新提交
- `c0639bc` - feat: 图片控件图标优化 + 帖子图片点击放大
- `d69431c` - fix: 图片控件与表情控件水平布局
- `7cde60a` - feat(P2): 实现图片上传功能（Supabase Storage）

### UI/UX 优化（✅ 完成）

#### 图片控件布局优化
- **问题**: 图片控件和表情控件上下布局，占用空间大
- **解决**: 改为水平布局，同一行显示
- **效果**: 更紧凑，与表情控件对齐

#### 图片图标优化
- **变更前**: 📷 相机图标
- **变更后**: 🖼️ 图片图标（更符合图片上传场景）

#### 图片点击放大功能
- **新增组件**: `image-lightbox.tsx`
- **功能**:
  - 点击帖子图片全屏查看
  - ESC 键或点击背景关闭
  - 加载动画
  - 图片自适应屏幕
  - 键盘导航支持

---

## 🚀 当前状态（2026-03-18 09:55）

### 已完成功能
- ✅ 用户认证系统
- ✅ 隐私设置（4 个预设 + 自定义）
- ✅ 邻里认证（小区/楼栋/单元/房号）
- ✅ 帖子发布（文字 + **表情** + **图片**）
- ✅ 帖子列表（真实数据 + 小区过滤）
- ✅ **图片点击放大预览**
- ✅ **评论功能**（列表/发布/删除）
- ✅ **点赞功能**（点赞/取消/实时计数）
- ✅ 数据库表（9 张）
- ✅ Vercel 自动部署

### 待部署功能
- 🔄 举报功能（需执行 SQL）
- 🔄 Rate Limiting（需执行 SQL）
- 🔄 管理员后台（/admin/reports）

### 待开发功能（P2 剩余）
- 🔄 用户关注
- 🔄 消息通知
- 🔄 个人主页
- 🔄 搜索功能

### 待优化项
- 🔄 补充 E2E 测试
- 🔄 Onboarding 流程设计
- 🔄 空状态设计优化
- 🔄 性能监控（Lighthouse）

---

## 📊 Git 提交历史（最近 10 条）

```
16658b8 feat: 实现评论和点赞功能
cb81fa9 fix: 修复头像上传按钮无响应（改用 useRef）
ebfa9b9 fix: 修复 AvatarEditor 中 getToken 未定义错误
c1f1482 feat: 添加昵称修改和头像上传功能
2c9baa7 fix: 移动端图片显示改为 3 列齐平
c0639bc feat: 图片控件图标优化 + 帖子图片点击放大
d69431c fix: 图片控件与表情控件水平布局
7cde60a feat(P2): 实现图片上传功能（Supabase Storage）
c8a039a docs: 更新项目日记 + 优化表情控件位置
328db08 feat: 添加表情选择控件
```
