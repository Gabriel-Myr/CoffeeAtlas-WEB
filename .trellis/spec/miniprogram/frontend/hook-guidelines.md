# Hook Guidelines

---

## Taro Page Lifecycle

### 页面生命周期优先用 Taro hooks

使用 Taro 提供的 hooks，不用 React 原生生命周期：

```tsx
import Taro, { useDidShow, useLoad, usePullDownRefresh, useReachBottom, useRouter } from '@tarojs/taro';

export default function AllBeansPage() {
  const router = useRouter();

  useLoad(() => {
    void fetchBeans();
  });

  useDidShow(() => {
    // tab 切回后需要刷新入口状态时再用
  });

  useReachBottom(() => {
    if (hasMore) void loadMore();
  });

  usePullDownRefresh(() => {
    refresh().finally(() => Taro.stopPullDownRefresh());
  });
}
```

### 路由参数

- 小程序里允许使用 Taro 的 `useRouter()`
- `useRouter` 只负责读取页面参数，不要把复杂入口状态全塞进 query string
- tab 页切换场景下，优先复用现有 `entry-intent` + route params 组合

---

## Async Request Pattern

### 分页与重新加载

```tsx
const [loading, setLoading] = useState(false);
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);
const loadingRef = useRef(false);
const requestVersionRef = useRef(0);

const loadBeanPage = async (currentPage: number) => {
  if (loadingRef.current) return;

  const requestVersion = requestVersionRef.current + 1;
  requestVersionRef.current = requestVersion;
  loadingRef.current = true;
  setLoading(true);

  try {
    const response = await getBeans({ page: currentPage, pageSize: 20 });
    if (requestVersion !== requestVersionRef.current) return;
    setItems((prev) => (currentPage === 1 ? response.items : [...prev, ...response.items]));
    setHasMore(response.pageInfo.hasNextPage);
    setPage(currentPage + 1);
  } finally {
    if (requestVersion === requestVersionRef.current) {
      loadingRef.current = false;
      setLoading(false);
    }
  }
};
```

规则：

- 分页请求要同时防“重复点击”和“旧请求回写”
- 重新加载列表前，先递增 `requestVersionRef`
- 页面里需要 `loading` 给 UI，也需要 `loadingRef` 给异步闭包读

### 搜索防抖

```tsx
const timerRef = useRef<ReturnType<typeof setTimeout>>();

const handleInput = (value: string) => {
  setKeyword(value);
  clearTimeout(timerRef.current);
  timerRef.current = setTimeout(() => {
    void reloadResults(value);
  }, 250);
};
```

规则：

- 防抖时间保持短，一般 250ms 到 300ms
- 组件卸载前记得清理 timer
- 搜索词统一先 `trim()` 再参与请求

## Forbidden Patterns

- 禁止写 Next.js 专用 hooks（如 `useSearchParams`、`next/navigation`）
- 禁止把“请求并发保护”只靠 `loading` 一个 state 硬扛
- 禁止在 hooks 或页面里直接调用 Supabase
- 禁止在 `packages/*` 中使用平台特定 hooks
