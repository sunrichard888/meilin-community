# 美邻网环境变量配置指南

## 本地开发 (.env.local)

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://tgffujhcruemykdviluw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZ1amhjcnVlbXlrZHZpbHV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NzkyMTcsImV4cCI6MjA4OTE1NTIxN30.pQRBtg6waenY6rMnf0sOs6yJSL9sC03J3YofFxero70

# ⚠️ Service Role Key - 仅服务端使用，切勿暴露给客户端！
# 从 Supabase Dashboard 获取：Settings → API → Service Role Key
SUPABASE_SERVICE_ROLE_KEY=你的_service_role_key
```

## Vercel 环境变量配置

访问 https://vercel.com/dashboard → 项目 → Settings → Environment Variables

添加以下变量：

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://tgffujhcruemykdviluw.supabase.co` | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | Production, Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` (service role) | Production, Preview |

⚠️ **重要**：
- `SUPABASE_SERVICE_ROLE_KEY` 拥有完全数据库权限，**绝不能**在客户端代码中使用
- 只在服务端 API Route (`/api/*`) 中使用
- Vercel 会自动保护环境变量，不会暴露给浏览器

## 获取 Service Role Key

1. 访问 https://supabase.com/dashboard
2. 选择项目 `tgffujhcruemykdviluw`
3. 点击 **Settings** (左侧底部齿轮图标)
4. 选择 **API**
5. 复制 **service_role key** (不是 anon public key)

## 安全提示

- ✅ 本地 `.env.local` 已添加到 `.gitignore`，不会被提交
- ✅ Vercel 环境变量是加密存储的
- ✅ 服务端 API Route 运行在服务器，客户端无法访问源码
- ❌ 不要在客户端组件中使用 `process.env.SUPABASE_SERVICE_ROLE_KEY`
- ❌ 不要把 Service Role Key 写在代码里
