# UI 组件规范

> 这是仓库级 UI 组件总览，覆盖 web 与 miniprogram。更细的层级规则见 `/Users/gabi/CoffeeAtlas-Web/.trellis/spec/web/frontend/component-guidelines.md` 和 `/Users/gabi/CoffeeAtlas-Web/.trellis/spec/miniprogram/frontend/component-guidelines.md`。

---

## UI 技术基底

### Web
- Next.js App Router
- Tailwind CSS v4（`app/globals.css`）
- `lucide-react` 图标
- `motion/react` 动效
- CSS 变量 + `data-theme` 主题切换

### Miniprogram
- Taro 3.x 组件体系
- SCSS
- 自定义 `Icon` 组件，用 data URI SVG 渲染图标
- CSS 动画和页面级进入效果

---

## 当前核心 Web 组件

### `HomePageClient`
- 路径：`/Users/gabi/CoffeeAtlas-Web/apps/web/app/HomePageClient.tsx`
- 角色：首页交互壳
- 负责：搜索、tab、主题切换、Atlas 与列表视图切换
- 特点：仍保留内联 `BeanCard`

### `AllBeansClient`
- 路径：`/Users/gabi/CoffeeAtlas-Web/apps/web/app/all-beans/AllBeansClient.tsx`
- 角色：完整目录页客户端壳
- 负责：搜索、主题、列表展示
- 特点：同样保留内联 `BeanCard`

### `OriginAtlasExplorer`
- 路径：`/Users/gabi/CoffeeAtlas-Web/apps/web/components/atlas/OriginAtlasExplorer.tsx`
- 角色：Atlas 风格产地探索主组件
- 负责：continent / country 级联浏览、统计卡片、地图版式
- 特点：是当前 UI 风格最强的设计锚点，相关改动要避免退化成通用卡片布局

### `MapSilhouette`
- 路径：`/Users/gabi/CoffeeAtlas-Web/apps/web/components/atlas/MapSilhouette.tsx`
- 角色：地图轮廓 SVG 展示组件
- 输入：`path`、`color`、`detail`、`interactive`
- 特点：不是内联组件，已抽离为独立复用模块

### `AddBeanForm`
- 路径：`/Users/gabi/CoffeeAtlas-Web/apps/web/components/AddBeanForm.tsx`
- 角色：管理端录入表单
- 特点：包含可搜索 roaster 选择、字段校验、状态与货币输入

---

## 当前核心 Miniprogram 组件

### `BeanCard`
- 路径：`/Users/gabi/CoffeeAtlas-Web/apps/miniprogram/src/components/BeanCard/index.tsx`
- 角色：豆款列表卡片
- 特点：图片占位、价格 tag、销量 tag、点击跳详情

### `RoasterCard`
- 路径：`/Users/gabi/CoffeeAtlas-Web/apps/miniprogram/src/components/RoasterCard/index.tsx`
- 角色：烘焙商档案卡片
- 特点：支持 gallery / saved 变体、外链 quick actions、封面/徽记 fallback

### `SearchBar`
- 路径：`/Users/gabi/CoffeeAtlas-Web/apps/miniprogram/src/components/SearchBar/index.tsx`
- 角色：统一搜索输入

### `EmptyState`
- 路径：`/Users/gabi/CoffeeAtlas-Web/apps/miniprogram/src/components/EmptyState/index.tsx`
- 角色：空状态占位

### `Icon`
- 路径：`/Users/gabi/CoffeeAtlas-Web/apps/miniprogram/src/components/Icon/index.tsx`
- 角色：跨页面复用图标
- 特点：用 data URI SVG，而不是外部 icon 库

---

## 主题系统

Web 主题定义集中在：
- `/Users/gabi/CoffeeAtlas-Web/apps/web/app/globals.css`

当前主题：
- `warm`
- `dark`
- `green`
- `minimal`
- `japanese`

核心变量包括：
- `--color-*`
- `--atlas-*`
- `--font-sans`
- `--font-serif`
- `--shadow-*`

规则：
- 新 UI 优先复用这些变量，而不是直接写一堆硬编码颜色
- Atlas 相关组件优先使用 `--atlas-*` 变量
- 标题排版延续当前 `Inter + Cormorant Garamond/Playfair Display` 组合

---

## 动效规范

### Web

当前统一使用 `motion/react`：

```tsx
import { motion } from 'motion/react';
```

常见模式：
- 初始 `opacity + y`
- 卡片延迟入场
- hover 轻微位移或放大
- `layoutId` 用于 tab 指示器

### Miniprogram

- 主要依赖 SCSS animation / delay
- 卡片通过 `animationDelay` 做分批入场
- 不引入 web 端的 `motion/react`

---

## 响应式与平台边界

### Web
- 用 Tailwind 响应式 class
- Atlas 卡片和 grid 在桌面/移动端需要保持层级感，不要只为了省事退化成单列普通列表

### Miniprogram
- 只使用 `@tarojs/components`
- 不使用 HTML 标签
- 导航统一 `Taro.navigateTo`

---

## 当前已知例外

- `HomePageClient` / `AllBeansClient` 仍含内联卡片组件，这是现实，不是推荐默认模板
- web 图像展示中仍使用 `<img>` 的地方存在，不是所有场景都切到了 `next/image`
- miniprogram 的 Icon 体系与 web 图标体系分离，后续如做统一抽象要谨慎，不要破坏当前体积和兼容性
