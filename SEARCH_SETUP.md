# 搜索功能设置指南

## 问题原因

搜索功能需要先在数据库中创建全文搜索索引和函数，否则无法搜索到内容。

## 解决步骤

### 1. 执行数据库 SQL 迁移

登录 Supabase 控制台，进入 SQL Editor，依次执行以下 SQL 文件：

#### 第一步：关注系统（如果还没执行）
```sql
-- 文件：supabase-p2-follows.sql
```

#### 第二步：通知系统（已修复）
```sql
-- 文件：supabase-p2-notifications.sql
```

#### 第三步：搜索功能（必须执行）
```sql
-- 文件：supabase-p2-search.sql
```

### 2. 验证搜索功能

执行 SQL 后，等待 1-2 分钟让索引生效，然后测试：

1. **搜索帖子**: 输入帖子内容中的关键词
2. **搜索用户**: 输入用户昵称
3. **搜索建议**: 输入 2 个字符以上查看自动补全

### 3. 常见问题

#### Q: 搜索还是没结果？
**A**: 检查以下几点：
1. 确认 SQL 已执行成功（无错误）
2. 确认数据库中有帖子数据
3. 尝试搜索已知存在的帖子内容
4. 检查浏览器控制台是否有错误

#### Q: 搜索建议不显示？
**A**: 
1. 确保输入至少 2 个字符
2. 检查网络请求是否成功（F12 查看 Network）
3. 确认 `/api/search/suggestions` API 正常

#### Q: 搜索响应慢？
**A**: 
1. 首次搜索可能需要建立缓存
2. 检查数据库索引是否正确创建
3. 大量数据时搜索可能需要 500ms-1s

## SQL 执行顺序

```
1. supabase-p2-follows.sql（关注系统）
2. supabase-p2-notifications.sql（通知系统）
3. supabase-p2-search.sql（搜索功能）
```

**注意**: 如果之前执行过旧版本的 SQL，建议先删除旧的函数和索引再重新执行。

## 手动测试搜索

在 Supabase SQL Editor 中测试搜索函数：

```sql
-- 测试搜索帖子
SELECT * FROM search_posts('测试关键词', 20, 0, NULL, NULL);

-- 测试搜索用户
SELECT * FROM search_users('张三', 20, 0);

-- 测试搜索建议
SELECT * FROM get_search_suggestions('测试', 5);
```

如果这些函数返回结果，说明数据库层面正常，问题可能在前端。
