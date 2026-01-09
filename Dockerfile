# 基于 Node.js 20 的官方镜像
FROM node:20-alpine as build

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 复制 .env.local 配置文件到容器
COPY .env.local .env.local

# 打包项目
RUN pnpm build

# 使用一个更轻的镜像来运行应用
FROM node:20-alpine

# 安装 pnpm
RUN npm install -g pnpm

# 设置工作目录
WORKDIR /app

# 复制构建好的文件
COPY --from=build /app ./

# 复制 .env.local 配置文件到容器
COPY --from=build /app/.env.local .env.local

# 暴露端口
EXPOSE 8000

# 设置环境变量（如果有的话，譬如生产环境的 NODE_ENV）
ENV NODE_ENV=production

# 启动应用
CMD ["pnpm", "start"]
