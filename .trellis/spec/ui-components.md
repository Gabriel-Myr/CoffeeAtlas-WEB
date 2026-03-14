# UI 组件规范

## 组件库

### 图标库
- **lucide-react**: 主要图标库
- 常用图标：`Search`, `Filter`, `Coffee`, `Palette`, `Settings`

```tsx
import { Search, Coffee } from 'lucide-react';

<Search className="w-5 h-5" />
<Coffee className="w-6 h-6 text-amber-600" />
```

### 动画库
- **framer-motion**: 页面和组件动画
- 包名：`motion`（版本 12.34.3）

```tsx
import { motion, AnimatePresence } from 'framer-motion';
```

## 主要组件

### 1. HomePageClient

**位置**: `app/HomePageClient.tsx`

**功能**:
- 首页主组件
- 地图式咖啡豆浏览
- 按大洲分类展示
- 主题切换

**Props**:
```typescript
interface HomePageClientProps {
  initialBeans: CoffeeBean[];
}
```

**特点**:
- 使用 `'use client'` 标记
- 集成 Framer Motion 动画
- 支持 5 种主题切换
- 响应式设计

---

### 2. AllBeansClient

**位置**: `app/all-beans/AllBeansClient.tsx`

**功能**:
- 完整咖啡豆目录
- 搜索和筛选
- 列表/网格视图切换

**Props**:
```typescript
interface AllBeansClientProps {
  initialBeans: CoffeeBean[];
}
```

**特点**:
- 实时搜索（客户端过滤）
- 支持按产地、品种、处理法筛选
- 虚拟滚动（如果列表很长）

---

### 3. MapSilhouette

**位置**: `app/HomePageClient.tsx`（内联组件）

**功能**:
- 渲染大洲地图轮廓
- SVG 图形展示

**Props**:
```typescript
interface MapSilhouetteProps {
  path: string;      // SVG path 数据
  color: string;     // 主题色
  isLarge?: boolean; // 是否大尺寸
}
```

**使用示例**:
```tsx
<MapSilhouette
  path="M10,10 L50,50 ..."
  color="#E07A5F"
  isLarge={true}
/>
```

---

### 4. AddBeanForm

**位置**: `components/AddBeanForm.tsx`

**功能**:
- 添加新咖啡豆表单
- 字段验证

**字段**:
- 烘焙商名称
- 咖啡豆名称
- 产地、品种、处理法
- 价格、库存状态

---

## 主题系统

### 主题定义

```typescript
type ThemeOption = 'warm' | 'dark' | 'green' | 'minimal' | 'japanese';

const themes = [
  { id: 'warm', name: '温暖奶咖', color: '#f5f0e8' },
  { id: 'dark', name: '深色咖啡馆', color: '#1a1614' },
  { id: 'green', name: '清新绿茶', color: '#f0f5f2' },
  { id: 'minimal', name: '极简白咖啡', color: '#fafafa' },
  { id: 'japanese', name: '日式和风', color: '#f4f1ee' },
];
```

### 主题切换实现

通过修改根元素的 `data-theme` 属性：

```tsx
const [currentTheme, setCurrentTheme] = useState<ThemeOption>('warm');

useEffect(() => {
  document.documentElement.setAttribute('data-theme', currentTheme);
}, [currentTheme]);
```

### CSS 变量

在 `app/globals.css` 中定义主题变量：

```css
[data-theme="warm"] {
  --bg-primary: #f5f0e8;
  --text-primary: #2c2420;
  --accent: #d4a574;
}

[data-theme="dark"] {
  --bg-primary: #1a1614;
  --text-primary: #f5f0e8;
  --accent: #c9a87c;
}
```

---

## 大洲数据配置

```typescript
const CONTINENTS = [
  {
    id: 'asia',
    name: '亚洲',
    icon: '🌏',
    color: '#E07A5F',  // 珊瑚红
    countries: ['云南', '印尼', '越南', '泰国', '印度', '也门']
  },
  {
    id: 'africa',
    name: '非洲',
    icon: '🌍',
    color: '#F2CC8F',  // 暖黄
    countries: ['埃塞俄比亚', '肯尼亚', '卢旺达', '坦桑尼亚', '乌干达']
  },
  {
    id: 'americas',
    name: '美洲',
    icon: '🌎',
    color: '#81B29A',  // 薄荷绿
    countries: ['哥伦比亚', '巴西', '危地马拉', '哥斯达黎加', '巴拿马', ...]
  },
];
```

---

## 动画规范

### 页面进入动画

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {content}
</motion.div>
```

### 列表项动画

```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.2, delay: index * 0.05 }}
>
  {item}
</motion.div>
```

### Hover 动画

```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  点击我
</motion.button>
```

---

## 响应式设计

### Tailwind 断点

```tsx
<div className="
  grid
  grid-cols-1          /* 移动端：1 列 */
  md:grid-cols-2       /* 平板：2 列 */
  lg:grid-cols-3       /* 桌面：3 列 */
  xl:grid-cols-4       /* 大屏：4 列 */
  gap-4
">
  {items}
</div>
```

### 移动端优化

- 触摸友好的按钮尺寸（最小 44x44px）
- 简化移动端导航
- 优化移动端搜索体验

---

## 组件开发规范

### 1. 组件文件结构

```tsx
'use client';  // 如果需要

import { useState } from 'react';
import { motion } from 'framer-motion';

// Props 类型定义
interface MyComponentProps {
  title: string;
  items: Item[];
}

// 组件实现
export default function MyComponent({ title, items }: MyComponentProps) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div>
      {/* 组件内容 */}
    </div>
  );
}
```

### 2. 样式规范

- 优先使用 Tailwind CSS 类
- 复杂样式使用 CSS Modules 或 styled-components
- 避免内联样式（除非动态计算）

```tsx
// ✅ 推荐：Tailwind
<div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-md">

// ❌ 避免：内联样式
<div style={{ display: 'flex', padding: '24px', background: 'white' }}>
```

### 3. 性能优化

- 使用 `React.memo` 避免不必要的重渲染
- 使用 `useMemo` 缓存计算结果
- 使用 `useCallback` 缓存回调函数

```tsx
const MemoizedComponent = React.memo(MyComponent);

const filteredItems = useMemo(() => {
  return items.filter(item => item.active);
}, [items]);
```
