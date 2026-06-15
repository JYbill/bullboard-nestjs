只作为类型使用时：

```ts
import type { UserDto } from "./user.dto";
```

默认导入只作为类型使用时：

```ts
import type UserConfig from "./user-config";
```

命名空间类型导入：

```ts
import type * as PrismaTypes from "./generated";
```

同一个模块同时导入类型和值时，可使用内联 `type`：

```ts
import { createUser, type UserDto } from "./user";
```

如果周围代码习惯拆分导入，也可以拆成两条：

```ts
import { createUser } from "./user";
import type { UserDto } from "./user";
```
