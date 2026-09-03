```json
{
  "deploy:docker": "bash ./docker-build.sh -p <platform>"
}
```

`<platform>` 必须替换为项目实际 Dockerfile 的平台前缀，例如 `x86-debian.Dockerfile` 对应 `x86-debian`；不要把示例平台名当成所有后台项目的默认值。
