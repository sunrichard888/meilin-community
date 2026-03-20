const fs = require('fs');
const path = require('path');

// 收集所有页面路由
const pages = new Set(['/']);
const appDir = path.join(__dirname, '../src/app');

function collectPages(dir, base = '') {
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    if (item === 'api') return;
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (item.startsWith('[')) {
        pages.add(`/api-check-skip${base}`); // 动态路由跳过
      } else {
        collectPages(fullPath, path.join(base, item));
      }
    } else if (item === 'page.tsx') {
      pages.add(base || '/');
    }
  });
}

collectPages(appDir);

// 扫描所有链接
const linkPattern = /href=["']([^"']+?)["']/g;
const brokenLinks = new Map();

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let match;
  while ((match = linkPattern.exec(content)) !== null) {
    const href = match[1];
    // 跳过外部链接、锚点、动态参数
    if (href.startsWith('http') || href.startsWith('#') || href.includes('[')) return;
    
    // 检查是否是内部页面链接
    const route = href.split('?')[0];
    if (!pages.has(route) && !route.startsWith('/api')) {
      if (!brokenLinks.has(route)) {
        brokenLinks.set(route, []);
      }
      brokenLinks.get(route).push(filePath);
    }
  }
}

function scanDir(dir) {
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && item !== 'api') {
      scanDir(fullPath);
    } else if (item.endsWith('.tsx')) {
      scanFile(fullPath);
    }
  });
}

scanDir(appDir);

console.log('=== 检查到的潜在问题链接 ===\n');
if (brokenLinks.size === 0) {
  console.log('✅ 未发现明显问题链接');
} else {
  brokenLinks.forEach((files, link) => {
    console.log(`❌ ${link}`);
    files.forEach(f => console.log(`   - ${path.relative(appDir, f)}`));
  });
}
