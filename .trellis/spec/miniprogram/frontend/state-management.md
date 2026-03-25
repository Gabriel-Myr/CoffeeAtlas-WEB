# State Management

> 小程序侧默认不用全局状态库。优先把状态分成三类：页面瞬时状态、跨页入口状态、storage 持久化状态。

---

## 1. Page State

页面内的筛选、tab、loading、error、分页结果，用 `useState` / `useMemo` / `useRef` 管理。

典型场景：

- `all-beans` 的 `activeTab`、筛选项、`beans`、`page`、`hasMore`
- 首页 atlas 的 `selectedContinent`、`selectedCountry`、`searchQuery`
- 请求并发保护用 `loadingRef`、`requestVersionRef`

规则：

- 只影响当前页面渲染的状态，不要提前塞到 storage
- 由请求派生出来的展示文案，优先用 `useMemo` 计算，不额外复制一份 state
- 重新加载列表时，重置列表结果、分页游标、错误状态要一起做

---

## 2. Cross-Page Entry State

小程序 tab 切换有参数限制，所以跨页入口状态不要只靠 URL。

当前仓库已有两种方式：

- 普通页面参数：`useRouter().params`
- tab 入口意图：`entry-intent` / `entry-options`

适用原则：

- 能直接放 query 的简单值，走 route params
- 需要跨 tab 保留“从哪个入口进入”的语义，走现有 `entry-intent`
- 不要把一次性的入口意图长期留在 storage 里不清理

---

## 3. Persistent State In Storage

持久化状态统一走 `src/utils/storage.ts`，不要在页面里直接散写 `Taro.setStorageSync`。

当前已存在的状态包括：

- `app_token`
- `auth_user`
- `coffee_favorites`
- `roaster_favorites`
- `pending_favorites`
- `coffee_history`
- `onboarding_profile`

规则：

- 新增持久化 key 时，先判断是不是已有 helper 可复用
- 收藏、用户、onboarding 这类状态要通过 helper 读写，避免页面各自拼 shape
- storage 里的数据结构一旦改动，要同步检查页面 consumer 和类型定义

---

## 4. Runtime Config State

API 联调地址不算业务状态，统一放 `src/utils/api-config.ts`。

规则：

- 页面不要各自缓存一份 base URL
- 接口请求前由 `src/services/api.ts` 统一校验
- “未配置 API 地址”的提示属于必须保留的安全网

---

## Forbidden Patterns

- 禁止引入 Redux、Zustand、Jotai 等全局状态库
- 禁止在 `packages/*` 中存储平台特定状态
- 禁止页面组件直接散写底层 storage key
- 禁止把一次性入口意图和长期持久化状态混在同一个 helper 里
