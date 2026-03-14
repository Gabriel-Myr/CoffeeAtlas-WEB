# 微信小程序接入 - Phase 1: API 中间层并行实施计划

**生成时间**: 2026-03-12
**任务**: 为微信小程序构建 RESTful API 中间层
**并行策略**: 4 个独立 API 端点可完全并行开发

---

## 并行分组

### Layer 1: 核心 API 端点（4 个并行任务）

所有任务完全独立，无依赖关系，可同时并行执行。

---

## 子任务详情

### Task 1: 咖啡豆列表 API

**Builder**: builder-beans-list
**文件范围**:
- `app/api/beans/route.ts` (创建)

**实施步骤**:
1. 创建 `app/api/beans/route.ts` 文件
2. 实现 GET 方法，支持以下查询参数：
   - `limit`: 限制返回数量（可选，默认无限制）
   - `offset`: 偏移量，用于分页（可选，默认 0）
3. 调用 `getCatalogBeans(limit)` 获取数据
4. 返回标准 JSON 格式：
   ```json
   {
     "success": true,
     "data": [...],
     "count": 50,
     "total": 200
   }
   ```
5. 添加错误处理，返回 500 状态码和错误信息
6. 添加 console.error 日志记录错误

**验收标准**:
- [ ] API 端点 `/api/beans` 可访问
- [ ] 支持 limit 参数
- [ ] 返回正确的 JSON 格式
- [ ] 错误处理正常工作
- [ ] TypeScript 类型检查通过

**依赖**: 无

---

### Task 2: 咖啡豆详情 API

**Builder**: builder-beans-detail
**文件范围**:
- `app/api/beans/[id]/route.ts` (创建)
- `lib/catalog.ts` (修改 - 添加 getBeanById 函数)

**实施步骤**:
1. 在 `lib/catalog.ts` 中添加 `getBeanById(id: string)` 函数：
   - 查询 `roaster_beans` 表，条件：`id = ? AND status = 'ACTIVE'`
   - 关联查询 `roasters` 和 `beans` 表
   - 返回单个 `CoffeeBean` 对象或 null
2. 创建 `app/api/beans/[id]/route.ts` 文件
3. 实现 GET 方法，从 URL 参数获取 id
4. 调用 `getBeanById(id)` 获取数据
5. 如果找不到，返回 404 状态码
6. 返回标准 JSON 格式：
   ```json
   {
     "success": true,
     "data": { ... }
   }
   ```
7. 添加错误处理

**验收标准**:
- [ ] API 端点 `/api/beans/:id` 可访问
- [ ] 找到数据时返回 200 和咖啡豆详情
- [ ] 找不到数据时返回 404
- [ ] 错误处理正常工作
- [ ] TypeScript 类型检查通过

**依赖**: 无

---

### Task 3: 烘焙商列表 API

**Builder**: builder-roasters-list
**文件范围**:
- `app/api/roasters/route.ts` (创建)
- `lib/catalog.ts` (修改 - 添加 getRoasters 函数)

**实施步骤**:
1. 在 `lib/catalog.ts` 中添加 `getRoasters(limit?: number)` 函数：
   - 查询 `roasters` 表，选择 `id, name, city`
   - 按 `name` 排序
   - 支持 limit 参数
   - 返回 `Roaster[]` 数组
2. 定义 `Roaster` 接口：
   ```typescript
   export interface Roaster {
     id: string;
     name: string;
     city: string;
   }
   ```
3. 创建 `app/api/roasters/route.ts` 文件
4. 实现 GET 方法，支持 `limit` 查询参数
5. 调用 `getRoasters(limit)` 获取数据
6. 返回标准 JSON 格式
7. 添加错误处理

**验收标准**:
- [ ] API 端点 `/api/roasters` 可访问
- [ ] 支持 limit 参数
- [ ] 返回烘焙商列表
- [ ] 错误处理正常工作
- [ ] TypeScript 类型检查通过

**依赖**: 无

---

### Task 4: 烘焙商详情 API

**Builder**: builder-roasters-detail
**文件范围**:
- `app/api/roasters/[id]/route.ts` (创建)
- `lib/catalog.ts` (修改 - 添加 getRoasterById 和 getRoasterBeans 函数)

**实施步骤**:
1. 在 `lib/catalog.ts` 中添加两个函数：

   a. `getRoasterById(id: string)`:
   - 查询 `roasters` 表，条件：`id = ?`
   - 返回单个 `Roaster` 对象或 null

   b. `getRoasterBeans(roasterId: string, limit?: number)`:
   - 查询该烘焙商的所有咖啡豆
   - 复用 `getCatalogBeans` 的逻辑，但添加 `roaster_id` 过滤
   - 返回 `CoffeeBean[]` 数组

2. 创建 `app/api/roasters/[id]/route.ts` 文件
3. 实现 GET 方法：
   - 从 URL 参数获取 id
   - 调用 `getRoasterById(id)` 获取烘焙商信息
   - 调用 `getRoasterBeans(id)` 获取该烘焙商的咖啡豆
   - 如果烘焙商不存在，返回 404
4. 返回格式：
   ```json
   {
     "success": true,
     "data": {
       "roaster": { ... },
       "beans": [ ... ]
     }
   }
   ```
5. 添加错误处理

**验收标准**:
- [ ] API 端点 `/api/roasters/:id` 可访问
- [ ] 返回烘焙商信息和其咖啡豆列表
- [ ] 找不到时返回 404
- [ ] 错误处理正常工作
- [ ] TypeScript 类型检查通过

**依赖**: 无

---

## 并行执行流程

```
Layer 1 (并行执行):
├─ Task 1: builder-beans-list      → app/api/beans/route.ts
├─ Task 2: builder-beans-detail    → app/api/beans/[id]/route.ts + lib/catalog.ts
├─ Task 3: builder-roasters-list   → app/api/roasters/route.ts + lib/catalog.ts
└─ Task 4: builder-roasters-detail → app/api/roasters/[id]/route.ts + lib/catalog.ts
```

**注意**: Task 2, 3, 4 都会修改 `lib/catalog.ts`，但修改的是不同的函数，不会产生冲突。

---

## 集成测试

所有 Builder 完成后，运行以下测试：

```bash
# 启动开发服务器
npm run dev

# 测试 API 端点
curl http://localhost:3000/api/beans?limit=10
curl http://localhost:3000/api/beans/<bean-id>
curl http://localhost:3000/api/roasters
curl http://localhost:3000/api/roasters/<roaster-id>
```

---

## 后续阶段

Phase 1 完成后，继续：
- **Phase 2**: Taro 项目初始化
- **Phase 3**: 核心功能迁移
- **Phase 4**: 样式适配
- **Phase 5**: 测试和优化
