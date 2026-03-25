# Component Guidelines

---

## Web 端组件模式

### 服务端 vs 客户端

- 默认服务端组件，需要交互时加 `'use client'`
- 服务端组件负责数据获取，传 `initialData` 给客户端组件

```tsx
// page.tsx（服务端）
export default async function Page() {
  const beans = await getCatalogBeans(100);
  return <PageClient initialBeans={beans} />;
}

// PageClient.tsx（客户端）
'use client';
export default function PageClient({ initialBeans }) {
  const [beans, setBeans] = useState(initialBeans);
}
```

### Props 定义

用 `interface` 定义 props，不用 `type`：

```tsx
interface BeanCardProps {
  bean: CoffeeBean;
  onFavorite?: (id: string) => void;
}

export default function BeanCard({ bean, onFavorite }: BeanCardProps) {}
```

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
- 禁止在组件内直接调用 Supabase（web 端服务端组件除外）
- 禁止在 `packages/*` 中引入平台特定依赖
