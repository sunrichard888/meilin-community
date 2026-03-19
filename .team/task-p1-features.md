# P1 功能增强 - 任务清单

## 目标
完成美邻网 P1 级别的 4 个核心功能，提升用户体验和数据展示能力。

---

## 功能 1: 热门话题页面真实数据

**文件**: `src/app/hot-topics/page.tsx`

**现状**: 静态假数据

**需求**:
- [ ] 从数据库获取真实的分类统计数据
- [ ] 显示每个分类的参与人数、帖子数
- [ ] 显示趋势（上升/下降/稳定）
- [ ] 热门帖子推荐从数据库获取
- [ ] 点击分类可跳转到对应筛选的 feed 页面

**技术实现**:
- 调用 `/api/posts` 按分类统计
- 计算趋势（对比上周数据）
- 按帖子数排序显示

---

## 功能 2: 社区公告页面增强

**文件**: `src/app/announcements/page.tsx`

**现状**: 静态假数据，无法发布

**需求**:
- [ ] 从数据库获取真实公告
- [ ] 管理员可发布新公告
- [ ] 支持置顶/编辑/删除
- [ ] 公告分类（通知/活动/安全/其他）
- [ ] 支持富文本内容

**技术实现**:
- 创建 `announcements` 表
- 管理员权限验证
- CRUD 操作

---

## 功能 3: 社区概况页面真实数据

**文件**: `src/app/community-stats/page.tsx`

**现状**: 静态假数据

**需求**:
- [ ] 真实统计用户数、帖子数、评论数、点赞数
- [ ] 热门小区排行（按用户/帖子数）
- [ ] 活跃用户排行（按发帖/互动数）
- [ ] 今日/本周/本月统计数据
- [ ] 图表展示（可选）

**技术实现**:
- 聚合查询数据库
- 按小区分组统计
- 用户活跃度计算

---

## 功能 4: 搜索功能

**文件**: `src/app/search/page.tsx`, `/api/search`

**现状**: 基础搜索页面

**需求**:
- [ ] 全文搜索帖子内容
- [ ] 按分类筛选
- [ ] 按时间排序（最新/最热）
- [ ] 搜索建议/自动补全
- [ ] 搜索结果高亮

**技术实现**:
- Supabase 全文搜索
- 搜索建议 API
- 搜索结果分页

---

## 数据库迁移

### 1. 公告表
```sql
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'notice',
  is_pinned BOOLEAN DEFAULT FALSE,
  author_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. 搜索优化
```sql
-- 为 posts 添加全文搜索索引
ALTER TABLE posts ADD COLUMN search_vector tsvector;
CREATE INDEX posts_search_idx ON posts USING GIN(search_vector);
```

---

## 实施顺序

1. **社区概况页面** - 最简单，纯统计查询
2. **热门话题页面** - 基于分类统计
3. **社区公告页面** - 需要新表和权限
4. **搜索功能** - 最复杂，单独处理

---

## 验收标准

- [ ] 所有页面显示真实数据
- [ ] 数据实时更新
- [ ] 加载状态友好
- [ ] 空状态处理得当
- [ ] 移动端响应式正常
- [ ] TypeScript 编译通过
- [ ] 构建成功

---

## 团队分工建议

- **Driver**: 负责代码实现
- **Reviewers**: 代码审查、测试验证
- **协调**: 任务分配、进度跟踪

---

*创建时间：2026-03-19*
