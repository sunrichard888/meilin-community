# 美邻网 - 数据库设置指南

## 重要提示

**搜索功能和消息系统需要先在数据库中执行 SQL 迁移才能正常工作！**

---

## 必须执行的 SQL 文件

按顺序在 Supabase SQL Editor 中执行以下文件：

### 1. 关注系统（如果还没执行）
**文件**: `supabase-p2-follows.sql`

创建内容:
- `follows` 表 - 关注关系
- `notifications` 表 - 通知系统
- 触发器和索引

### 2. 通知系统（已修复）
**文件**: `supabase-p2-notifications.sql`

创建内容:
- 通知触发器（评论/点赞/关注）
- 通知清理函数
- 索引优化

### 3. 搜索功能 ⚠️ 必须执行
**文件**: `supabase-p2-search.sql`

创建内容:
- `posts.search_vector` - 帖子全文搜索索引
- `users.search_vector` - 用户全文搜索索引
- `search_posts()` 函数 - 搜索帖子
- `search_users()` 函数 - 搜索用户
- `get_search_suggestions()` 函数 - 搜索建议

**如果不执行这个，搜索功能将无法工作！**

### 4. 消息系统 ⚠️ 必须执行
**文件**: `supabase-p3-messages.sql`

创建内容:
- `message_rooms` 表 - 会话表
- 消息表增强（room_id, read_at）
- `get_user_rooms()` 函数 - 获取会话列表
- `get_or_create_room()` 函数 - 创建会话
- 触发器和索引

---

## 执行步骤

1. 登录 [Supabase](https://supabase.com)
2. 进入你的项目
3. 点击左侧 **SQL Editor**
4. 点击 **New Query**
5. 复制对应 SQL 文件的内容
6. 粘贴到编辑器
7. 点击 **Run** 执行
8. 确认无错误后继续下一个

---

## 验证方法

### 验证搜索功能
在 SQL Editor 中测试：
```sql
-- 测试搜索用户（替换'测试'为实际存在的用户昵称）
SELECT * FROM search_users('测试', 10, 0);

-- 测试搜索帖子
SELECT * FROM search_posts('测试', 10, 0, NULL, NULL);
```

如果返回结果，说明搜索功能正常。

### 验证消息系统
```sql
-- 检查表是否存在
SELECT * FROM message_rooms LIMIT 1;

-- 检查函数是否存在
SELECT get_user_rooms('你的用户 ID', 10, 0);
```

---

## 常见问题

### Q: 搜索用户没有结果？
**A**: 检查以下几点：
1. 确认已执行 `supabase-p2-search.sql`
2. 确认数据库中有用户数据
3. 搜索关键词至少 2 个字符
4. 尝试搜索已知存在的用户昵称

### Q: 消息页面无法加载会话？
**A**: 检查：
1. 确认已执行 `supabase-p3-messages.sql`
2. 检查浏览器控制台是否有错误
3. 确认已登录

### Q: SQL 执行报错？
**A**: 
1. 检查是否按顺序执行
2. 如果表已存在，错误可以忽略
3. 如果是权限错误，检查 RLS 策略

---

## 执行后的效果

### 搜索功能
- ✅ 可以搜索帖子内容
- ✅ 可以搜索用户昵称
- ✅ 搜索建议自动补全

### 消息系统
- ✅ 可以查看会话列表
- ✅ 可以发起新聊天
- ✅ 可以搜索用户

---

**执行完所有 SQL 后，刷新页面测试功能！**
