FROM node:22-slim AS builder
WORKDIR /app
COPY package.json .
RUN npm config set registry http://192.168.88.115:8081/repository/npm-proxy/ # 备用 RUN npm config set registry https://registry.npmmirror.com
RUN npm install --ignore-scripts --legacy-peer-deps
COPY . .
RUN sed -i 's/"typeCheck": true/"typeCheck": false/' nest-cli.json
RUN npm run build

FROM node:22-slim AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package.json .
RUN npm config set registry http://192.168.88.115:8081/repository/npm-proxy/ # 备用 RUN npm config set registry https://registry.npmmirror.com
RUN npm i pm2 -g
RUN pm2 install pm2-logrotate
RUN pm2 set pm2-logrotate:max_size 200M && pm2 set pm2-logrotate:retain 60
RUN npm install --omit=dev --ignore-scripts --legacy-peer-deps && npm cache clean --force
COPY --from=builder /app/pm2.config.js .
COPY --from=builder /app/dist dist
RUN apt-get update && apt-get install -y \
    bind9-dnsutils \
    bash \
    bash-completion \
    vim \
    openssl \
    curl \
    tcpdump \
    net-tools

# 清理缓存文件
RUN rm -rf /tmp/* && rm -rf /var/tmp/*
EXPOSE 3000
CMD ["pm2", "start", "pm2.config.js", "--no-daemon"]
