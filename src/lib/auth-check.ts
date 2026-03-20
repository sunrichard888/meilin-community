import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * 获取当前用户的 access token
 * 用于客户端组件中需要认证的场景
 */
export async function getCurrentToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

/**
 * 检查用户是否已登录
 * @returns 如果已登录返回 token，否则返回 null
 */
export async function requireAuth(): Promise<string | null> {
  const token = await getCurrentToken();
  if (!token) {
    // 客户端环境下可以跳转
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
    }
    return null;
  }
  return token;
}
