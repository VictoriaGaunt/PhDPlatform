FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/client/package*.json ./packages/client/
COPY packages/server/package*.json ./packages/server/
# Устанавливаем ВСЕ зависимости для сборки
RUN npm ci --include=dev
COPY . .
# Собираем проект
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Копируем только production-зависимости
COPY package*.json ./
COPY packages/client/package*.json ./packages/client/
COPY packages/server/package*.json ./packages/server/
RUN npm ci --omit=dev
# Копируем собранные артефакты из стадии builder
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/client/dist ./packages/client/dist
CMD ["npm", "run", "start"]