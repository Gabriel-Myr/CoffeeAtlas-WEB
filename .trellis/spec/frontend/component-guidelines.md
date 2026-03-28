# Component Guidelines

---

## 通用组件约定

### Props 定义

用 `interface` 定义 props，不用 `type`：

```tsx
interface BeanCardProps {
  bean: CoffeeBean;
  onFavorite?: (id: string) => void;
}

export default function BeanCard({ bean, onFavorite }: BeanCardProps) {}
```

### Stitch MCP（`stitchmcp`）使用约定

- 适合场景：新页面原型、整块布局探索、多版视觉方案比较、统一设计系统
- 不适合场景：只改一两处文案、间距、颜色，或者只是修一个现有交互 bug；这类改动优先直接改代码
- 开始前先读现有上下文：`list_projects`、`get_project`、`list_screens`、`get_screen`
- 新建页面草图优先用 `generate_screen_from_text`
- 基于现有 screen 局部改稿优先用 `edit_screens`
- 需要多版比较时用 `generate_variants`
- 需要统一视觉 token 时先 `list_design_systems`；没有再 `create_design_system`，随后 `update_design_system`，需要批量落到 screen 时再 `apply_design_system`
- Stitch 产物默认只当视觉和结构参考，不直接等同于仓库最终代码；落地时仍要遵守本仓库的目录、类型、数据流和平台约束
- Stitch 生成的字段名、按钮文案、卡片结构，不要直接当成真实接口契约；涉及 API、DTO、props 时回到 `type-safety.md`
- 生成或改稿后，必须手动补看 loading、empty、error、mobile 尺寸和长列表状态，不要只看默认展示态
- 设计稿落地到小程序时要改写成 Taro 可运行结构，不要直接照搬 web DOM

---

## 小程序端组件模式

### 组件结构

每个组件一个目录，包含 `index.tsx` + `index.scss`：

```
components/BeanCard/
├── index.tsx
└── index.scss
```

### Taro 组件规范

- 使用 `@tarojs/components` 的原生组件（`View`、`Text`、`Image`）
- 不使用 HTML 标签（`div`、`span`、`img`）
- 导航使用 `Taro.navigateTo`，不用 `<Link>`

```tsx
import { View, Image, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';

interface BeanCardProps {
  bean: CoffeeBean;
}

export default function BeanCard({ bean }: BeanCardProps) {
  const handleTap = () => {
    Taro.navigateTo({ url: `/pages/bean-detail/index?id=${bean.id}` });
  };

  return (
    <View className="bean-card" onClick={handleTap}>
      <Text className="bean-card__name">{bean.name}</Text>
    </View>
  );
}
```

### 样式命名

使用 BEM 命名：`block__element--modifier`

```scss
.bean-card { }
.bean-card__image { }
.bean-card__badge { }
.bean-card__tag--sales { }
.bean-card__tag--price { }
```

### 图片处理

- 使用 `mode="aspectFill"` + `lazyLoad`
- 无图时显示占位符（`Icon` 组件）

```tsx
{bean.imageUrl ? (
  <Image src={bean.imageUrl} mode="aspectFill" lazyLoad className="bean-card__img" />
) : (
  <View className="bean-card__placeholder">
    <Icon name="coffee" size={64} color="rgba(139,90,43,0.25)" />
  </View>
)}
```

## 禁止模式

- 小程序中禁止使用 HTML 标签
- 禁止在组件内直接调用 Supabase
- 禁止在 `packages/*` 中引入平台特定依赖
