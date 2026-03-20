const fs = require('fs');
const path = require('path');

const files = [
  'src/app/admin/users/page.tsx',
  'src/app/admin/moderation/page.tsx',
  'src/app/admin/announcements/page.tsx'
];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  // 移除 Suspense 包装函数
  const fixed = content
    .replace(/function \w+\(\) \{[\s\S]*?return \([\s\S]*?<Suspense[\s\S]*?<\/Suspense>[\s\S]*?\);[\s\S]*?\}[\s\S]*?export default function/, 'export default function')
    .replace(/export default function \w+Page\(\) \{[\s\S]*?return \([\s\S]*?<\w+ \/>[\s\S]*?\);[\s\S]*?\}/, (match) => {
      return match.replace(/<\w+ \/>/, '<UserManagementInner />');
    });
  
  fs.writeFileSync(file, fixed);
  console.log(`✅ Fixed: ${file}`);
});
