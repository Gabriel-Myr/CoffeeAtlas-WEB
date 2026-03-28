# UI 组件规范

> 这是仓库级 UI 组件总览，当前以小程序为主。更细的层级规则见 `/Users/gabi/CoffeeAtlas-Web/.trellis/spec/frontend/component-guidelines.md` 和 `/Users/gabi/CoffeeAtlas-Web/.trellis/spec/miniprogram/frontend/component-guidelines.md`。

---

## UI 技术基底

### Miniprogram
- Taro 3.x 组件体系
- SCSS
- 自定义 `Icon` 组件，用 data URI SVG 渲染图标
- CSS 动画和页面级进入效果

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

## 动效规范

### Miniprogram

- 主要依赖 SCSS animation / delay
- 卡片通过 `animationDelay` 做分批入场
- 不引入 web 端的 `motion/react`

---

## 响应式与平台边界

### Miniprogram
- 只使用 `@tarojs/components`
- 不使用 HTML 标签
- 导航统一 `Taro.navigateTo`

---

## 当前已知例外

- miniprogram 的 Icon 体系与其他平台的图标体系分离，后续如做统一抽象要谨慎，不要破坏当前体积和兼容性
