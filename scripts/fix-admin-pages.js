const fs = require('fs');

const files = [
  'src/app/admin/users/page.tsx',
  'src/app/admin/moderation/page.tsx', 
  'src/app/admin/announcements/page.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Remove Suspense wrapper function and export default directly
  content = content.replace(/function \w+\(\) \{[\s\S]*?return \([\s\S]*?<Suspense[\s\S]*?<\/Suspense>[\s\S]*?\);[\s\S]*?\}\n\nexport default function/, 'export default function');
  
  fs.writeFileSync(file, content);
  console.log(`✅ Fixed: ${file}`);
});
