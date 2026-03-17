import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 图片优化配置
  images: {
    // 允许的外部图片域名
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    // 图片格式
    formats: ['image/avif', 'image/webp'],
  },

  // 生产环境优化
  productionBrowserSourceMaps: false,

  // 压缩输出
  compress: true,

  // 启用 React 严格模式（开发环境）
  reactStrictMode: true,

  // 头部值配置
  headers: async () => [
    {
      // 缓存控制
      source: '/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=60, stale-while-revalidate=300',
        },
      ],
    },
  ],
};

export default nextConfig;
