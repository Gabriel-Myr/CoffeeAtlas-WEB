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

### 引导文案边界

- `pages/onboarding/*`、发现页轻问答、入口提示卡这类引导流程页面，默认只改结构、状态和跳转，不改已有可见文案。
- 已有题目标题、题目描述、步骤提示、按钮文案、跳过/重答提示，除非用户明确要求，否则不要为了适配新页面、新流程或新布局而重写。
- 如果必须把一段引导流程从一个页面挪到另一个页面，优先复用原文案，先保证“文字不变，位置变化”。
- 真正需要新增文案时，只补最小必要部分，并在交付说明里明确指出新增了哪类引导文案。

### Stitch MCP（`stitchmcp`）使用约定

- 适合场景：新页面原型、筛选区或卡片区重排、同一页面多版方案比较、统一一组页面的视觉基调
- 开始前先读现有项目和 screen：`list_projects`、`get_project`、`list_screens`、`get_screen`
- 新页面草图优先用 `generate_screen_from_text`
- 在已有 screen 上调整布局或文案优先用 `edit_screens`
- 需要比较多个方向时用 `generate_variants`
- 需要先统一颜色、字体、圆角等设计 token 时，先 `list_design_systems`，没有再 `create_design_system`，随后 `update_design_system`，需要批量套用时再 `apply_design_system`
- Stitch 结果只当视觉参考，落地代码必须改写成 `@tarojs/components`、Taro 路由和小程序可运行样式，不要直接照搬 web 结构
- prompt 里要明确写触屏、小屏、安全区、tabbar、长列表和无 hover 的前提，否则生成结果很容易偏成 web 页面
- Stitch 生成的筛选项、字段名、按钮流程，不直接代表真实 API 或 storage 结构；这部分要回到 `type-safety.md`、`src/services/api.ts`、`src/utils/storage.ts` 核对
- 如果只是改一个小组件或一条交互文案，优先手改代码，不要重新生成整页
- 生成后至少验证首屏、滚动列表、空态、错误态、低网速加载态，以及微信开发者工具中的实际显示

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
