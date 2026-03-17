# 可访问性测试清单 (A11y Checklist)

## 键盘导航

- [ ] 所有交互元素可通过 Tab 键访问
- [ ] 焦点顺序符合逻辑（从上到下，从左到右）
- [ ] 焦点指示器清晰可见（outline 或 border）
- [ ] 模态对话框打开时焦点被限制在对话框内
- [ ] 按 Escape 键可关闭模态对话框
- [ ] 下拉菜单可通过键盘操作（Enter/Space 打开，Esc 关闭）
- [ ] 表单字段可通过标签关联（label + for）

## 屏幕阅读器兼容

- [ ] 所有图片有 alt 文本（装饰性图片 alt=""）
- [ ] 表单字段有清晰的标签
- [ ] 错误消息与相关字段关联（aria-describedby）
- [ ] 动态内容变化使用 aria-live 区域通知
- [ ] 按钮和链接有描述性文本（避免"点击这里"）
- [ ] 图标按钮有 aria-label
- [ ] 表格有适当的标题和范围
- [ ] 页面有正确的语言属性（lang="zh-CN"）

## 颜色对比度

- [ ] 正文文本对比度 ≥ 4.5:1（WCAG AA）
- [ ] 大文本（18px+ 或 14px+ 粗体）对比度 ≥ 3:1
- [ ] UI 组件和图形元素对比度 ≥ 3:1
- [ ] 不单独使用颜色传达信息

## 视觉设计

- [ ] 字体大小 ≥ 14px（正文）
- [ ] 行高 ≥ 1.5（正文）
- [ ] 段落间距适当
- [ ] 链接有下划线或其他明显标识
- [ ] 按钮最小尺寸 44x44px
- [ ] 触摸目标间距适当

## 响应式设计

- [ ] 页面在 320px 宽度下可用
- [ ] 内容可水平滚动（无横向滚动条）
- [ ] 字体大小可放大至 200% 不失真
- [ ] 横屏模式下内容正常显示

## 表单可访问性

- [ ] 必填字段明确标识
- [ ] 错误提示清晰且具体
- [ ] 错误字段自动获得焦点
- [ ] 表单提交后显示成功/失败消息
- [ ] 输入字段有适当的类型（email, tel, number）
- [ ] 自动聚焦仅在必要时使用

## 动态内容

- [ ] 加载状态明确指示
- [ ] 异步操作结果有反馈
- [ ] 轮播/自动播放内容可暂停
- [ ] 超时操作有警告和延长选项

## 测试工具

### 手动测试
1. 仅使用键盘浏览整个应用
2. 使用屏幕阅读器（NVDA/VoiceOver）测试
3. 放大页面至 200% 检查布局
4. 禁用 CSS 检查内容顺序

### 自动化工具
- [ ] axe DevTools 浏览器扩展
- [ ] WAVE 评估工具
- [ ] Lighthouse 可访问性审计
- [ ] pa11y CI 集成

### 命令行测试
```bash
# 使用 pa11y 测试
npx pa11y http://localhost:3000

# 使用 lighthouse
npx lighthouse http://localhost:3000 --only-categories=accessibility
```

## 举报功能特定检查

- [ ] 举报按钮有清晰的 aria-label
- [ ] 举报对话框有 role="dialog" 和 aria-modal="true"
- [ ] 对话框标题使用 aria-labelledby
- [ ] 单选按钮有正确的分组（fieldset + legend）
- [ ] 错误消息使用 aria-live="polite"
- [ ] 提交成功后有焦点管理
- [ ] 关闭对话框后焦点返回触发按钮

## 参考资源

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Checklist](https://webaim.org/standards/wcag/checklist)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
