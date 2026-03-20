// 美邻网 E2E 测试 - 用户认证流程
import { test, expect } from '@playwright/test';

test.describe('用户认证', () => {
  test('应该能够访问登录页面', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/美邻网/);
    await expect(page.getByText('登录账号')).toBeVisible();
  });

  test('应该能够访问注册页面', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByText('创建账号')).toBeVisible();
  });

  test('应该显示邮箱格式错误', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel('邮箱').fill('invalid-email');
    await page.getByLabel('邮箱').blur();
    await expect(page.getByText('邮箱')).toBeVisible();
  });

  test('应该能够登录管理员账号', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByLabel('邮箱').fill('56455611@qq.com');
    await page.getByLabel('密码').fill('Test123456!');
    await page.getByRole('button', { name: '登录' }).click();

    // 等待跳转
    await page.waitForURL('/');
    await expect(page.getByRole('link', { name: '发布' })).toBeVisible();
  });

  test('应该能够访问管理后台', async ({ page }) => {
    // 先登录
    await page.goto('/login');
    await page.getByLabel('邮箱').fill('56455611@qq.com');
    await page.getByLabel('密码').fill('Test123456!');
    await page.getByRole('button', { name: '登录' }).click();
    await page.waitForURL('/');

    // 访问管理后台
    await page.goto('/admin/dashboard');
    await expect(page.getByText('管理后台')).toBeVisible();
    await expect(page.getByText('总用户数')).toBeVisible();
  });
});
