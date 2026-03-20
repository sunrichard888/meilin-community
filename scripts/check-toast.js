const fs = require('fs');
const path = require('path');

const pages = [
  'activities', 'admin/announcements', 'admin/dashboard', 'admin/moderation',
  'admin/reports', 'admin/users', 'announcements', 'community-stats',
  'dashboard', 'discover', 'forgot-password', 'help', 'hot-topics',
  'login', 'market', 'messages/[user_id]', 'messages', 'neighbor',
  'notifications', 'posts/[id]', 'privacy', 'privacy-settings',
  'register', 'search', 'terms', 'users/[id]'
];

console.log('=== 检查 ToastProvider ===\n');

pages.forEach(page => {
  const filePath = path.join(__dirname, '../src/app', page, 'page.tsx');
  if (!fs.existsSync(filePath)) return;
  
  const content = fs.readFileSync(filePath, 'utf8');
  const hasToastProvider = content.includes('ToastProvider');
  const hasUseToast = content.includes('useToast');
  
  const status = hasUseToast && !hasToastProvider ? '❌ 缺失' : '✅';
  console.log(`${status} ${page.padEnd(25)} ToastProvider: ${hasToastProvider}, useToast: ${hasUseToast}`);
});
