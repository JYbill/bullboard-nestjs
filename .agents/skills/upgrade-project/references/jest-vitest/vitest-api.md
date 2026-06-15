```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
```

常见替换：

- `jest.fn()` → `vi.fn()`。
- `jest.spyOn()` → `vi.spyOn()`。
- `jest.mock()` → `vi.mock()`。
- `jest.clearAllMocks()` / `resetAllMocks()` / `restoreAllMocks()` → `vi.clearAllMocks()` / `vi.resetAllMocks()` / `vi.restoreAllMocks()`。
- `jest.useFakeTimers()` / `useRealTimers()` → `vi.useFakeTimers()` / `vi.useRealTimers()`。
- `jest.Mocked<T>` 等 Jest 类型改成从 `vitest` 导入的 `Mocked<T>`、`MockInstance` 等类型。

NestJS e2e 应保留应用关闭逻辑：

```ts
afterEach(async () => {
  await app?.close();
  app = undefined;
});
```
