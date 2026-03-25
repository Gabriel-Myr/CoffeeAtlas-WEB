# Component Guidelines

---

## Component Split

### 页面组件负责“编排”

页面文件通常放在 `pages/<name>/index.tsx`，负责：

- 读路由参数或入口意图
- 调接口、管理 loading / error / pagination
- 组合筛选条、卡片、空态等展示组件

像 `pages/index/index.tsx`、`pages/all-beans/index.tsx` 这种页面，允许保留较重的 orchestration 逻辑。

### 复用组件负责“展示或轻交互”

`components/*` 里的组件尽量只负责：

- 渲染 UI
- 把点击、输入等事件抛给页面
- 接收已经整理好的 props

不要让复用组件自己去决定 API 地址、读写 token、拼复杂查询条件。

---

## Component Structure

每个组件一个目录，通常包含 `index.tsx` + `index.scss`：

```
components/BeanCard/
├── index.tsx
└── index.scss
```

### Taro Component Rules

- 使用 `@tarojs/components` 的原生组件（`View`、`Text`、`Image`）
- 不使用 HTML 标签（`div`、`span`、`img`）
- 页面跳转用 `Taro.navigateTo` / `Taro.switchTab`
- tab 页之间如果需要带入口意图，优先复用现有 `entry-intent` 模式，不要临时发明一套

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

### Props And Boundaries

- props 用 `interface` 或清晰的 `type` 都可以，重点是名称明确、边界稳定
- 页面里已经做完的数据整理，不要再在组件里重复一遍
- 组件如果需要 favorite / selection 状态，优先接收布尔值或回调，不要自己直接读 storage

### Styling

使用 BEM 命名：`block__element--modifier`

```scss
.bean-card { }
.bean-card__image { }
.bean-card__badge { }
.bean-card__tag--sales { }
.bean-card__tag--price { }
```

### Images

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

## Forbidden Patterns

- 小程序中禁止使用 HTML 标签
- 禁止在 `components/*` 内直接调用 `src/services/api.ts`
- 禁止在组件内直接操作 token / onboarding / favorites storage
- 禁止在 `packages/*` 中引入平台特定依赖
