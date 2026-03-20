// 美邻网 E2E 测试 - 帖子功能
import { test, expect } from '@playwright/test';

test.describe('帖子功能', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.getByLabel('邮箱').fill('56455611@qq.com');
    await page.getByLabel('密码').fill('Test123456!');
    await page.getByRole('button', { name: '登录' }).click();
    await page.waitForURL('/');
  });

  test('应该能够访问首页', async ({ page }) => {
    await expect(page.getByText('邻里动态')).toBeVisible();
    await expect(page.getByRole('link', { name: '发布' })).toBeVisible();
  });

  test('应该显示帖子列表', async ({ page }) => {
    await page.goto('/dashboard');
    
    // 等待帖子加载
    await page.waitForSelector('[data-testid="post-card"]', { timeout: 5000 });
    const posts = page.getByTestId('post-card');
    await expect(posts.first()).toBeVisible();
  });

  test('应该能够点击帖子查看详情', async ({ page }) => {
    await page.goto('/dashboard');
    
    // 点击第一个帖子
    const firstPost = page.getByTestId('post-card').first();
    await firstPost.click();
    
    // 验证进入详情页
    await expect(page.url()).toContain('/posts/');
  });

  test('应该能够搜索帖子', async ({ page }) => {
    await page.goto('/search');
    
    const searchInput = page.getByPlaceholder('搜索帖子');
    await searchInput.fill('测试');
    await searchInput.press('Enter');
    
    // 验证搜索结果
    await expect(page.url()).toContain('q=测试');
  });
});
