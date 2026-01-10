# ==================== BUILD STAGE ====================
FROM node:18-alpine AS builder

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --include=dev

# Копируем исходный код
COPY . .

# Собираем TypeScript
RUN npm run build

# ==================== PRODUCTION STAGE ====================
FROM node:18-alpine AS production

WORKDIR /app

# Устанавливаем только production зависимости
COPY package*.json ./
RUN npm ci --only=production

# Копируем собранный код из builder stage
COPY --from=builder /app/dist ./dist

# Создаем необходимые директории
RUN mkdir -p uploads logs

# Устанавливаем права
RUN chown -R node:node /app

# Переключаемся на непривилегированного пользователя
USER node

# Открываем порт
EXPOSE ${PORT:-3000}

# Запускаем приложение
CMD ["node", "dist/index.js"]