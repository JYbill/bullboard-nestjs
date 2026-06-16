# bullboard-nestjs

- 功能：BullMQ dashboard，仅适配 BullMQ。
- 初衷：为了测试环境快速查看和操作队列，所以保留了较轻量的功能范围。

## 功能概要

- 包含查看、增加等基于 bull-board 的简单交互。
- ❌ bull-board 自定义选项未提取到环境变量。

## 镜像地址

Docker Hub：<https://hub.docker.com/r/jyxiaoqinvar/bullboard/tags>

下文中的 `<tag>` 请替换为 Docker Hub tags 页面中的实际镜像标签。

## 配置文件

部署目录示例使用 `~/bullboard`：

```shell
mkdir -p ~/bullboard/env ~/bullboard/logs
cd ~/bullboard
```

创建 `env/.env`：

```dotenv
# NestJS 端口
PORT=9110

# 面板认证账号
BULL_BOARD_USERNAME=root
# SHA-256 摘要内容（以下对应 1234567890 的 SHA-256 摘要）
BULL_BOARD_PASSWORD_HASH=c775e7b757ede630cd0aa1113bd102661ab38829ca52a6422ab782862f268646
```

创建 `env/bullmq.config.json`：

```jsonc
[
  {
    // Redis 主机地址
    "host": "127.0.0.1",
    // Redis 端口
    "port": 6379,
    // Redis 密码，没有可以留空字符串
    "password": "<redis-password>",
    // Redis DB 库号
    "dbNum": 0,
    // BullMQ 的 prefix，必填
    "bullPrefix": "bull",
    // Bull Board 展示前缀，可省略；建议以 @ 结尾用于分组
    "prefix": "app@",
    // 要展示的队列名列表；为空数组时自动展示该 Redis DB 内当前 prefix 下的所有 BullMQ 队列
    "queues": ["example-queue"]
  }
]
```

## 使用 Docker 部署

```shell
docker run -d \
  --name bullboard \
  -p 9110:9110 \
  -e TZ=Asia/Shanghai \
  -e LANG=zh_CN.UTF-8 \
  -v "$PWD/env:/app/env" \
  -v "$PWD/logs:/app/logs" \
  --restart unless-stopped \
  jyxiaoqinvar/bullboard:<tag>
```

常见操作：

```shell
# 查看日志
docker logs -f bullboard

# 停止容器
docker stop bullboard

# 启动容器
docker start bullboard

# 删除容器
docker rm -f bullboard
```

## 使用 Docker Compose 部署

创建 `docker-compose.yaml`：

```yaml
services:
  bullboard:
    image: jyxiaoqinvar/bullboard:<tag>
    container_name: bullboard
    ports:
      - "9110:9110"
    environment:
      TZ: "Asia/Shanghai"
      LANG: "zh_CN.UTF-8"
    volumes:
      - ./env:/app/env
      - ./logs:/app/logs
    restart: unless-stopped
```

启动和管理：

```shell
# 后台启动
docker compose up -d

# 查看日志
docker compose logs -f

# 停止并删除容器
docker compose down

# 启动容器
docker compose start

# 重启容器
docker compose restart

# 停止容器
docker compose stop
```

部署完成后访问：`http://<服务器 IP>:9110`。
