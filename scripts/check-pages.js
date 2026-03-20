const fs = require('fs');
const path = require('path');

// 遍历所有 page.tsx 文件
function findPages(dir, base = '') {
  const pages = [];
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // 跳过 api 目录
      if (item === 'api') return;
      pages.push(...findPages(fullPath, path.join(base, item)));
    } else if (item === 'page.tsx') {
      // 提取路由路径
      const route = base.replace(/\\/g, '/');
      pages.push(route || '/');
    }
  });
  
  return pages;
}

const appDir = path.join(__dirname, '../src/app');
const pages = findPages(appDir);

console.log('=== 美邻网所有页面路由 ===\n');
pages.forEach((page, i) => {
  console.log(`${i + 1}. ${page}`);
});

console.log(`\n总计：${pages.length} 个页面`);
