# Hook Guidelines

---

## 小程序端（Taro）

### 页面生命周期

使用 Taro 提供的 hooks，不用 React 原生生命周期：

```tsx
import { useLoad, useReachBottom, usePullDownRefresh } from '@tarojs/taro';

export default function AllBeansPage() {
  useLoad(() => {
    // 页面加载
    fetchBeans();
  });

  useReachBottom(() => {
    // 触底加载更多
    if (hasMore) loadMore();
  });

  usePullDownRefresh(() => {
    // 下拉刷新
    refresh().finally(() => Taro.stopPullDownRefresh());
  });
}
```

### 分页模式

```tsx
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);
const [loading, setLoading] = useState(false);

const loadMore = async () => {
  if (loading || !hasMore) return;
  setLoading(true);
  const res = await getBeans({ page: page + 1, pageSize: 20 });
  setItems(prev => [...prev, ...res.data.items]);
  setHasMore(res.data.hasMore);
  setPage(p => p + 1);
  setLoading(false);
};
```

### 搜索防抖

```tsx
const [keyword, setKeyword] = useState('');
const timerRef = useRef<ReturnType<typeof setTimeout>>();

const handleInput = (value: string) => {
  setKeyword(value);
  clearTimeout(timerRef.current);
  timerRef.current = setTimeout(() => {
    searchBeans(value);
  }, 300);
};
```

## 禁止模式

- 小程序中禁止使用 `useRouter`（Next.js 专用）
- 禁止在 hooks 内直接调用 Supabase
- 禁止在 `packages/*` 中使用平台特定 hooks
