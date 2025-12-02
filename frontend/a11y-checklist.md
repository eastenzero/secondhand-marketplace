# 可访问性 (A11y) 检查清单

## 1. 语义化 HTML
- [ ] 使用正确的标题层级 (`h1` - `h6`)，避免跳级。
- [ ] 使用 `<button>` 处理点击操作，而不是 `div` 或 `span`。
- [ ] 使用 `<nav>`, `<main>`, `<header>`, `<footer>` 等地标元素。
- [ ] 列表使用 `<ul>`, `<ol>`, `<dl>`。

## 2. 文本替代
- [ ] 所有 `<img>` 标签都有 `alt` 属性。
  - 装饰性图片使用 `alt=""`。
  - 信息性图片使用描述性文本。
- [ ] 图标按钮（如关闭、菜单）有 `aria-label` 或屏幕阅读器可见的文本。

## 3. 键盘导航
- [ ] 所有交互元素（链接、按钮、表单控件）都可以通过 Tab 键访问。
- [ ] 焦点顺序符合逻辑（从左到右，从上到下）。
- [ ] 焦点状态可见（`:focus` 样式）。
- [ ] 弹窗打开时焦点移入，关闭时焦点返回触发元素。

## 4. 表单
- [ ] 所有输入框都有关联的 `<label>`（使用 `for`/`id` 或包裹）。
- [ ] 必填项有明确标识（`required`, `aria-required`）。
- [ ] 错误信息与输入框关联（`aria-describedby`）。

## 5. 颜色与对比度
- [ ] 文本与背景对比度至少 4.5:1 (WCAG AA)。
- [ ] 不仅依靠颜色传达信息（如错误状态同时使用图标或文本）。

## 6. 动态内容 (ARIA)
- [ ] 加载状态使用 `role="status"` 或 `aria-busy`。
- [ ] 展开/折叠内容使用 `aria-expanded`。
- [ ] 选项卡使用 `role="tablist"`, `role="tab"`, `role="tabpanel"`。
- [ ] 弹窗使用 `role="dialog"` 和 `aria-modal="true"`。

## 自动化测试建议
使用 Playwright 结合 `@axe-core/playwright` 进行自动化检查：

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage should not have any automatically detectable accessibility issues', async ({ page }) => {
  await page.goto('/');
  
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  
  expect(accessibilityScanResults.violations).toEqual([]);
});
```
