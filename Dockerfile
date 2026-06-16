FROM node:26-slim AS base
WORKDIR /app
RUN apt-get update && \
  apt-get install -y --no-install-recommends openssl build-essential python3 && \
  apt-get clean && \
  apt-get autoclean && \
  apt-get autoremove -y && \
  rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*
RUN npm install -g pnpm && npm cache clean -f

FROM base AS install
COPY package.json .
RUN npm pkg delete scripts.prepare
COPY .npmrc .
COPY pnpm-lock.yaml .
RUN pnpm --version
RUN pnpm config list
RUN pnpm install --frozen-lockfile && pnpm store prune
COPY . .

FROM install AS format
RUN pnpm format

FROM install AS lint
RUN pnpm lint

FROM install AS test
RUN pnpm test:cov

FROM scratch AS coverage-report
COPY --from=test /app/coverage/ /

FROM install AS build
RUN pnpm build

FROM node:26-slim AS production
WORKDIR /app
ENV NODE_ENV=production
ENV LANG=C.utf8
ENV LC_ALL=C.utf8
RUN apt-get update && \
  apt-get install -y --no-install-recommends openssl build-essential python3 bash vim curl procps && \
  apt-get clean && \
  apt-get autoclean && \
  apt-get autoremove -y && \
  rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*
RUN npm install -g pm2 pnpm && npm cache clean -f
RUN pm2 install pm2-logrotate && \
  pm2 set pm2-logrotate:max_size 200M && \
  pm2 set pm2-logrotate:retain 7
COPY --from=build /app/package.json .
RUN npm pkg delete scripts.prepare
COPY --from=build /app/.npmrc .
COPY --from=build /app/pnpm-lock.yaml .
RUN pnpm install --prod --frozen-lockfile && pnpm store prune
COPY --from=build /app/pm2.config.cjs .
COPY --from=build /app/dist dist

EXPOSE 3000
CMD ["pm2-runtime", "pm2.config.cjs"]
