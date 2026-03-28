# State Management

> 本项目不使用全局状态库（Redux/Zustand/Jotai）。当前前端状态管理以小程序为主。

---

## 小程序端（Taro）

### 原则

- 页面级状态：`useState` 在页面组件内管理
- 跨页面共享：`utils/storage.ts`（Taro.setStorageSync）
- 认证状态：`utils/auth.ts` + storage

### 存储 Keys

```ts
// utils/storage.ts
const KEYS = {
  TOKEN: 'app_token',
  FAVORITES: 'coffee_favorites',
  HISTORY: 'coffee_history',
} as const;
```

### 认证状态

```ts
// utils/auth.ts
export function getToken(): string | null {
  return Taro.getStorageSync(KEYS.TOKEN) || null;
}

export function setToken(token: string): void {
  Taro.setStorageSync(KEYS.TOKEN, token);
}

export function logout(): void {
  Taro.removeStorageSync(KEYS.TOKEN);
  Taro.removeStorageSync(KEYS.FAVORITES);
}
```

### 收藏状态

收藏列表存储在 storage，登录后通过 `syncPendingFavorites` 同步到服务端：

```ts
export async function syncPendingFavorites(): Promise<void> {
  const local = Taro.getStorageSync<string[]>(KEYS.FAVORITES) || [];
  if (local.length === 0) return;
  await Promise.all(local.map(id => addFavorite(id)));
  Taro.removeStorageSync(KEYS.FAVORITES);
}
```

## 禁止模式

- 禁止引入 Redux、Zustand、Jotai 等全局状态库
- 禁止在 `packages/*` 中存储平台特定状态
- 禁止在组件间通过 props 传递超过 3 层的状态（考虑提升到页面级）
