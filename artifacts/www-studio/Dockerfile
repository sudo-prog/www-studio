FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY artifacts/www-studio/package.json artifacts/www-studio/package.json
RUN corepack enable && pnpm install --no-frozen-lockfile
COPY . .
RUN cd artifacts/www-studio && pnpm run build

FROM nginx:alpine
COPY --from=builder /app/artifacts/www-studio/dist/public /usr/share/nginx/html
COPY artifacts/www-studio/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
