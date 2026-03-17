import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Rate Limiting 配置
 */
const RATE_LIMIT_CONFIG = {
  // 每 10 分钟最多 3 帖
  windowMs: 10 * 60 * 1000, // 10 分钟
  maxRequests: 3,
  // 新账户前 3 帖需要审核
  newAccountPostLimit: 3,
};

/**
 * 简单的内存存储（生产环境建议使用 Redis）
 */
const requestStore = new Map<string, { count: number; resetTime: number }>();

/**
 * 检查 Rate Limit
 */
function checkRateLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = requestStore.get(identifier);

  if (!record || now > record.resetTime) {
    // 新窗口
    requestStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_CONFIG.windowMs,
    });
    return {
      allowed: true,
      remaining: RATE_LIMIT_CONFIG.maxRequests - 1,
      resetTime: now + RATE_LIMIT_CONFIG.windowMs,
    };
  }

  if (record.count >= RATE_LIMIT_CONFIG.maxRequests) {
    // 超出限制
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  // 增加计数
  record.count++;
  requestStore.set(identifier, record);

  return {
    allowed: true,
    remaining: RATE_LIMIT_CONFIG.maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * 中间件主函数
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 只对 API 请求进行 Rate Limiting
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // 获取用户标识（IP 或用户 ID）
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const userId = request.headers.get('x-user-id');
  const identifier = userId || ip;

  // 检查 Rate Limit
  const rateLimit = checkRateLimit(identifier);

  if (!rateLimit.allowed) {
    const resetInSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
    
    return NextResponse.json(
      {
        error: '操作过于频繁',
        message: `您发帖太频繁了，请 ${resetInSeconds} 秒后再试。`,
        retryAfter: resetInSeconds,
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': RATE_LIMIT_CONFIG.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimit.resetTime.toString(),
          'Retry-After': resetInSeconds.toString(),
        },
      }
    );
  }

  const response = NextResponse.next();

  // 添加 Rate Limit 响应头
  response.headers.set('X-RateLimit-Limit', RATE_LIMIT_CONFIG.maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
  response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString());

  return response;
}

/**
 * 配置中间件匹配的路由
 */
export const config = {
  matcher: [
    '/api/:path*',
  ],
};
