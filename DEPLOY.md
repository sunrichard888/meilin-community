# 美邻网 Vercel 部署配置指南

## 1. Vercel 环境变量配置

登录 Vercel 控制台，进入项目设置：

1. 访问 https://vercel.com/dashboard
2. 找到 `meilin-community` 项目
3. 点击 **Settings** → **Environment Variables**
4. 添加以下变量：

```
NEXT_PUBLIC_SUPABASE_URL=https://tgffujhcruemykdviluw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZ1amhjcnVlbXlrZHZpbHV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NzkyMTcsImV4cCI6MjA4OTE1NTIxN30.pQRBtg6waenY6rMnf0sOs6yJSL9sC03J3YofFxero70
```

5. **重要**：确保为 **Production** 和 **Preview** 环境都添加
6. 点击 **Save**
7. **重新部署**：进入 **Deployments** → 找到最新部署 → 点击 **⋮** → **Redeploy**

---

## 2. Supabase 数据库初始化

如果尚未创建数据库表，请在 Supabase 执行：

1. 访问 https://supabase.com/dashboard
2. 选择项目 `tgffujhcruemykdviluw`
3. 进入 **SQL Editor**
4. 新建查询，粘贴 `supabase-schema.sql` 内容
5. 点击 **Run** 执行

---

## 3. 验证连接

部署完成后，访问首页应该能看到：
- 如果未登录：显示"欢迎来到美邻网"空状态
- 如果已登录：显示帖子列表（可能是空的）

打开浏览器控制台，应该**没有** `ERR_TUNNEL_CONNECTION_FAILED` 错误。

---

## 4. 常见问题

### 问题 1: 404 Not Found
**原因**：Supabase URL 错误或项目不存在
**解决**：检查 `NEXT_PUBLIC_SUPABASE_URL` 是否正确

### 问题 2: Invalid API Key
**原因**：Anon Key 错误或过期
**解决**：在 Supabase Dashboard → Settings → API 重新获取

### 问题 3: relation "posts" does not exist
**原因**：数据库表未创建
**解决**：执行 `supabase-schema.sql`

### 问题 4: JWT expired
**原因**：Anon Key 已过期（默认 1 年）
**解决**：在 Supabase 重新生成 Anon Key

---

## 5. 本地测试

```bash
cd /root/.openclaw/workspace/meilin-nextjs
npm run dev
```

访问 http://localhost:3000 测试本地连接。
