/**
 * Lighthouse 性能测试配置
 * 运行：npx lighthouse http://localhost:3000 --config-path=lighthouse.config.js --output=html --output-path=./.lighthouse-report.html
 */

module.exports = {
  extends: 'lighthouse:default',
  settings: {
    // 性能测试配置
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    
    // 模拟移动端
    formFactor: 'mobile',
    throttling: {
      rttMs: 150,
      throughputKbps: 1638.4,
      cpuSlowdownMultiplier: 4,
    },
    
    // 屏幕配置
    screenEmulation: {
      mobile: true,
      width: 412,
      height: 823,
      deviceScaleFactor: 2.625,
      disabled: false,
    },
    
    // 性能预算
    budgets: [
      {
        path: '/',
        resourceCounts: [
          { resourceType: 'total', budget: 50 },
          { resourceType: 'stylesheet', budget: 5 },
          { resourceType: 'image', budget: 20 },
          { resourceType: 'font', budget: 5 },
          { resourceType: 'script', budget: 15 },
        ],
        resourceSizes: [
          { resourceType: 'total', budget: 2000 }, // 2MB
          { resourceType: 'script', budget: 500 }, // 500KB
          { resourceType: 'stylesheet', budget: 100 }, // 100KB
          { resourceType: 'image', budget: 1000 }, // 1MB
        ],
        timings: [
          { metric: 'first-contentful-paint', budget: 2000 }, // 2s
          { metric: 'largest-contentful-paint', budget: 2500 }, // 2.5s
          { metric: 'cumulative-layout-shift', budget: 0.1 },
          { metric: 'total-blocking-time', budget: 300 }, // 300ms
        ],
      },
    ],
  },
};
