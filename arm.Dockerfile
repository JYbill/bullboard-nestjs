FROM --platform=linux/arm64 node:24.8.0-slim AS builder
WORKDIR /app

COPY package.json .
COPY .npmrc .
RUN npm i -g pnpm && npm cache clean -f
RUN pnpm install --ignore-scripts && pnpm store prune
COPY . .
RUN pnpm build

FROM --platform=linux/arm64 node:24.8.0-slim AS production
WORKDIR /app

# 拆分方便检查每一层的磁盘占用
RUN echo "deb http://mirrors.aliyun.com/debian/ bookworm main" > /etc/apt/sources.list && \
   echo "deb http://mirrors.aliyun.com/debian/ bookworm-updates main" >> /etc/apt/sources.list && \
   echo "deb http://mirrors.aliyun.com/debian-security/ bookworm-security main" >> /etc/apt/sources.list && \
   rm -rf /etc/apt/sources.list.d/*
# 一些方便线上调试的工具（避免弱网环境不方便）
RUN apt-get update && apt-get install -y bash vim curl && apt-get autoclean && apt-get autoremove -y && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

ENV NODE_ENV=production
COPY package.json .
COPY .npmrc .
RUN npm i pm2 pnpm -g --verbose && npm cache clean -f
RUN pnpm config set package-lock false
RUN pm2 install pm2-logrotate
RUN pm2 set pm2-logrotate:max_size 200M && pm2 set pm2-logrotate:retain 60
RUN pnpm install --prod --ignore-scripts && pnpm store prune

COPY pm2.config.js .
COPY --from=builder /app/dist dist

EXPOSE 3000
CMD ["pm2-runtime", "pm2.config.js"]
