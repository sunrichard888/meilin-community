# E2E 测试指南

## 安装

```bash
# 已安装 Playwright
npm install --save-dev @playwright/test

# 安装浏览器
npx playwright install --with-deps chromium
```

## 运行测试

```bash
# 运行所有测试
npm run test:e2e

# 有头模式（显示浏览器）
npm run test:e2e:headed

# UI 模式
npm run test:e2e:ui

# 运行特定测试
npx playwright test e2e/auth.spec.ts

# 生成测试报告
npx playwright show-report
```

## 测试文件

- `e2e/auth.spec.ts` - 用户认证测试
- `e2e/posts.spec.ts` - 帖子功能测试

## CI/CD 集成

Vercel 会自动运行 E2E 测试（配置中）。

## 测试账号

E2E 测试使用管理员账号：
- 邮箱：`56455611@qq.com`
- 密码：`Test123456!`
