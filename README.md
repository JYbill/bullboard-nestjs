# bullboard-nestjs
- 功能：bullmq dashboard(仅适配了bullmq)
- `初衷`：为了测试环境快速测试，所以牺牲了很多可以优化的点
- ⚠️ 注意package.json中已定义"packageManager": "pnpm@9.15.2", 建议使用pnpm二次开发或安装与构建



## 功能该要

- 仅包含查看、增加等基于bull-board库的简单交互
- ❌ bull-board自定义选项未提取到环境变量





## 构建前提
- 本地构建条件
  - 已安装docker
  - nodejs v22环境(我的开发环境)
- 将x86-debian.Dockerfile中的`http://192.168.88.115:8081/repository/npm-proxy/`替换成npm镜像源
```ts
// 比如淘宝镜像源: https://registry.npmmirror.com
```

## 构建方式:构建docker tar包
-  构建方式：构建成docker tar包
```shell
pnpm deploy:docker:local
```
- 此时代码目录下会有一个`images.tar`文件
- 上传到服务器，并运行
```shell
docker load -i <path>

# 🌰例子
docker load -i ./image.tar
```

## 构建方式:构建镜像推送到docker仓库
- 设置推送的docker仓库，在`docker-build.sh`文件内
```shell
# 这里可以指定为自己的私有docker仓库，这里假设你的url为"192.168.88.115:8082"，用户名为"public"，密码为"123456"
# 内网(nexus docker私有化仓库)
docker login --username=public --password=123456 192.168.88.115:8082
docker tag ${image_id} 192.168.88.115:8082/${service_name}:${docker_tag}
docker push 192.168.88.115:8082/${service_name}:${docker_tag}
```
- 运行构建
```shell
pnpm deploy:docker
```
- 记住输出最后的tag
```shell
# 记住这个x86-debian-main_26117f5851，后面docker-compose.yaml需要使用
# 输出
x86-debian-main_26117f5851: digest: sha256:c8986d852c1520b314d9fe2275af5a15646191630de6c7823cd8d68cfdc73f0c size: 3669
docker push done!
```


## docker compose部署
- 将本项目的docker-compose.yaml文件拖入到自定义的目录，比如`~/bullboard/`下
- 配置环境变量，在`~/bullboard/`
```shell
mkdir env
touch .env
touch bullmq.config.jsonc
```
```dotenv
# .env文件
# nestjs端口
PORT=9110

# 面板认证账号
BULL_BOARD_USERNAME=root
# SHA-256 摘要内容（以下对应1234567890的SHA-256摘要）
BULL_BOARD_PASSWORD_HASH=c775e7b757ede630cd0aa1113bd102661ab38829ca52a6422ab782862f268646
```
```jsonc
[
  {
    // prefix 可省略
    "host": "192.168.88.234",
    "port": 6379,
    "password": "1234567890",
    "dbNum": 0,
    "bullPrefix": "RAGBullMQ",
    "queues": ["executor"]
  }
]
```
- `bullmq.config.jsonc` 放在 `env/` 目录下，容器会跟着 `docker-compose.yaml` 的目录挂载一起读到。
- 仓库内也提供了 `env/bullmq-template.config.jsonc` 模板，可以复制后再按实际值修改。
- 更改`docker-compose.yaml`文件
```yaml
# 这里我假设url为"192.168.88.115:8082"需要修改成自己的docker仓库地址, 后面的tag也需要更改构建之后的tag（如上面的："x86-debian-main_26117f5851"）
image: 192.168.88.115:8082/bullboard:x86-origin-develop_xqv_501b64a2da
```
- 启用与常见操作
```shell
# 后台形式启动
docker compose up -d
# 删除容器 
docker compose down
# 启动容器
docker compose start
# 重启容器
docker compose restart
# 停止容器
docker compose stop
```
