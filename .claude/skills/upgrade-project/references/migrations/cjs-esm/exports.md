只导出类型时：

```ts
export type { UserDto } from './user.dto.ts'
```

同时导出类型和值时：

```ts
export { createUser, type UserDto } from './user.ts'
```
