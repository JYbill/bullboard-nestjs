删除这些形式：

```ts
import "source-map-support/register";
```

```ts
import sourceMapSupport from "source-map-support";

sourceMapSupport.install();
```

```ts
require("source-map-support/register");
```

如果周围代码是 CommonJS 或其他写法，按实际语法删除等价注册逻辑，不要改无关启动逻辑。
