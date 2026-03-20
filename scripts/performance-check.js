# 性能监控脚本
const { lighthouse } = require('@lhci/cli');
const fetch = require('node-fetch');

const urls = [
  'https://community.ling-q.tech/',
  'https://community.ling-q.tech/login',
  'https://community.ling-q.tech/dashboard',
];

async function runLighthouse() {
  console.log('🚀 开始 Lighthouse 性能测试...\n');

  for (const url of urls) {
    console.log(`📊 测试：${url}`);
    
    try {
      const response = await fetch(
        `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=PERFORMANCE&category=ACCESSIBILITY&category=BEST_PRACTICES&strategy=mobile`
      );
      
      const data = await response.json();
      
      const perf = data.lighthouseResult.categories.performance.score * 100;
      const a11y = data.lighthouseResult.categories.accessibility.score * 100;
      const best = data.lighthouseResult.categories['best-practices'].score * 100;
      
      console.log(`   性能：${perf.toFixed(0)} 分`);
      console.log(`   无障碍：${a11y.toFixed(0)} 分`);
      console.log(`   最佳实践：${best.toFixed(0)} 分`);
      console.log('');
    } catch (error) {
      console.error(`   ❌ 测试失败：${error.message}`);
      console.log('');
    }
  }
}

runLighthouse();
