# 美邻网项目日记

**项目名称**: 美邻网 (Meilin Community)  
**项目地址**: https://github.com/sunrichard888/meilin-community  
**部署地址**: https://community.ling-q.tech  
**技术栈**: Next.js 16 + Supabase + Vercel  
**记录时间**: 2026-03-17

---

## 📊 项目概况

美邻网是一个基于 Next.js + Supabase 的社区邻里平台，旨在连接小区居民，提供邻里认证、隐私设置、帖子发布等功能。

### 核心功能
- ✅ 用户认证（注册/登录/修改密码）
- ✅ 个人设置（昵称/头像）
- ✅ 邻里认证（小区/楼栋/单元/房号）
- ✅ 隐私设置（可见性/交互权限/通知设置）
- 🔄 帖子发布（待开发）
- 🔄 帖子列表（待开发）

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

---

## 🔧 遇到的问题与解决方案

### 问题 1: Vercel 构建失败 - npm install 卡死

**时间**: 2026-03-17 11:45  
**错误信息**:
```
npm error Exit handler never called!
npm error This is an error with npm itself.
Error: Command "npm install" exited with 1
```

**原因分析**:
1. npm 在 Vercel 环境有已知 bug
2. 全局 `.npmrc` 配置了腾讯云镜像，Vercel 无法访问

**解决方案**:
```bash
# 1. 备份全局.npmrc
mv /root/.npmrc /root/.npmrc.backup

# 2. 切换到 yarn
echo '{"installCommand": "yarn install --frozen-lockfile"}' > vercel.json

# 3. 重新生成 yarn.lock
rm yarn.lock && yarn install

# 4. 提交推送
git push origin master
```

**结果**: ✅ 构建成功

---

### 问题 2: 隐私设置 API 返回 401 "请先登录"

**时间**: 2026-03-17 14:28  
**错误信息**:
```
POST /api/privacy-settings 401 (Unauthorized)
Error: 请先登录
```

**原因分析**:
1. Next.js App Router 中，API 路由不能直接使用 `createClient().auth.getUser()`
2. Cookie 在客户端组件和 API 路由之间不自动同步
3. 前端 fetch 没有传递 Authorization header

**解决方案**:

**1. auth.tsx 添加 getToken 方法**:
```typescript
async function getToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}
```

**2. 前端传递 token**:
```typescript
const token = await getToken();
const response = await fetch("/api/privacy-settings", {
  headers: {
    'Authorization': token ? `Bearer ${token}` : '',
  },
});
```

**3. API 路由验证 token**:
```typescript
const authHeader = request.headers.get('authorization');
const token = authHeader.replace('Bearer ', '');
const { data: { user } } = await supabase.auth.getUser(token);
```

**结果**: ✅ 认证通过

---

### 问题 3: RLS 策略阻止插入 - 42501 错误

**时间**: 2026-03-17 15:32  
**错误信息**:
```
new row violates row-level security policy for table "user_privacy_settings"
Error code: 42501
```

**原因分析**:
API 路由使用 anon key 时，`auth.uid()` 无法获取用户 ID，导致 RLS 策略检查失败。

**解决方案**:

**使用 Service Role Key 绕过 RLS**:
```typescript
// 1. 先用 anon key 验证 token
const authClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
const { data: { user } } = await authClient.auth.getUser(token);

// 2. 再用 service role key 操作数据库
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
await supabase.from('user_privacy_settings').insert({...});
```

**3. Vercel 添加环境变量**:
- Name: `SUPABASE_SERVICE_ROLE_KEY`
- Value: 从 Supabase Dashboard → Settings → API 获取

**结果**: ✅ 数据插入成功

---

### 问题 4: neighbor_profiles 表不存在 - PGRST205 错误

**时间**: 2026-03-17 16:57  
**错误信息**:
```
Could not find the table 'public.neighbor_profiles' in the schema cache
Error code: PGRST205
```

**原因分析**:
数据库表未创建，SQL 脚本未执行。

**解决方案**:
```sql
CREATE TABLE IF NOT EXISTS neighbor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  community_name VARCHAR(200) NOT NULL,
  building_number VARCHAR(20) NOT NULL,
  unit_number VARCHAR(10) NOT NULL,
  room_number VARCHAR(10) NOT NULL,
  introduction TEXT,
  verification_status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 创建索引
CREATE INDEX neighbor_profiles_user_id_idx ON neighbor_profiles(user_id);

-- 创建触发器
CREATE OR REPLACE FUNCTION update_neighbor_profiles_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_neighbor_profiles_updated_at
  BEFORE UPDATE ON neighbor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_neighbor_profiles_updated_at_column();
```

**结果**: ✅ 表创建成功

---

### 问题 5: Git push 网络超时

**时间**: 多次出现  
**错误信息**:
```
fatal: unable to access 'https://github.com/sunrichard888/meilin-community.git/': 
GnuTLS recv error (-110): The TLS connection was non-properly terminated.
```

**原因分析**:
服务器到 GitHub 的网络连接不稳定。

**解决方案**:
```bash
# 1. 配置 Git 超时时间
git config --global http.postBuffer 524288000
git config --global http.lowSpeedLimit 0
git config --global http.lowSpeedTime 999999

# 2. 手动推送
cd /root/.openclaw/workspace/meilin-nextjs
git push origin master

# 3. 使用手机热点（备选）
```

**结果**: ⚠️ 需要手动推送

---

## 📁 数据库表结构

### 已创建表（7 张）

| 表名 | 说明 | 状态 |
|------|------|------|
| `users` | 用户信息 | ✅ |
| `posts` | 动态帖子 | ✅ |
| `comments` | 评论 | ✅ |
| `messages` | 私信 | ✅ |
| `likes` | 点赞 | ✅ |
| `neighbor_profiles` | 邻里认证 | ✅ |
| `user_privacy_settings` | 隐私设置 | ✅ |

### user_privacy_settings 表结构
```sql
CREATE TABLE user_privacy_settings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) UNIQUE,
  
  -- 个人信息可见性
  show_community_name BOOLEAN DEFAULT true,
  show_building_info BOOLEAN DEFAULT false,
  show_introduction BOOLEAN DEFAULT true,
  show_nickname BOOLEAN DEFAULT true,
  
  -- 交互权限
  allow_direct_messages BOOLEAN DEFAULT true,
  allow_comments BOOLEAN DEFAULT true,
  allow_mentions BOOLEAN DEFAULT true,
  
  -- 通知设置
  notify_new_comments BOOLEAN DEFAULT true,
  notify_new_likes BOOLEAN DEFAULT true,
  notify_new_followers BOOLEAN DEFAULT true,
  notify_community_updates BOOLEAN DEFAULT true,
  
  -- 隐私预设
  privacy_preset VARCHAR(20) DEFAULT 'custom',
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 🎯 Ensemble 团队贡献

### 团队成员
| 成员 | 角色 | 贡献 |
|------|------|------|
| Marty Cagan | 产品专家 | MVP 范围建议、优先级调整 |
| Don Norman | UI/UX 设计师 | 44px 触摸目标、错误提示优化 |
| Richard Bartle | 社区设计专家 | 分级认证、隐私平衡策略 |
| James Bach | QA 分析师 | 测试策略、27 个测试用例 |
| Lee Robinson | Next.js 专家 | Server Actions、Zod 验证 |
| Kent Beck | TDD 专家 | 测试框架、小步迭代 |

### 核心建议采纳
1. **Marty**: 隐私设置先于邻里信息发布 ✅
2. **Don**: Toggle 开关 44px 触摸目标 ✅
3. **Richard**: 默认隐藏楼栋信息 ✅
4. **James**: TDD 开发、27 个测试用例 ✅
5. **Lee**: 使用 `@supabase/ssr` ✅
6. **Kent**: Vitest 测试框架 ✅

---

## 📈 当前状态

### 已完成功能
- ✅ 用户认证系统
- ✅ 隐私设置（4 个预设 + 自定义）
- ✅ 邻里认证（小区/楼栋/单元/房号）
- ✅ 数据库表（7 张）
- ✅ Vercel 自动部署

### 待开发功能（P1）
- 🔄 帖子发布功能
- 🔄 帖子列表连接真实数据
- 🔄 图片上传
- 🔄 评论功能

### 待优化项
- 🔄 邻里认证代码改进（Server Actions）
- 🔄 补充测试用例（组件测试、E2E）
- 🔄 Onboarding 流程设计
- 🔄 空状态设计

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
const token = authHeader.replace('Bearer ', '');
const { user } = await supabase.auth.getUser(token);
```

### 2. Supabase RLS 策略
**教训**: API 使用 anon key 时 `auth.uid()` 无法获取用户

**最佳实践**:
```typescript
// 使用 Service Role Key 绕过 RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

### 3. Vercel 部署
**教训**: 国内 npm 镜像 Vercel 无法访问

**最佳实践**:
- 移除全局 `.npmrc` 镜像配置
- 使用 `yarn` 替代 `npm`
- 在 Vercel 添加 `SUPABASE_SERVICE_ROLE_KEY` 环境变量

---

## 📚 参考文档

- [Next.js 文档](https://nextjs.org/docs)
- [Supabase 文档](https://supabase.com/docs)
- [Vercel 部署指南](https://vercel.com/docs)
- [Ensemble Team Skill](https://github.com/openclaw/openclaw/tree/main/skills/ensemble-team)

---

**最后更新**: 2026-03-17 17:27  
**下次更新**: 待 P1 功能完成后
