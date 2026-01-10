FROM node:18-alpine

WORKDIR /app

# Установка зависимостей
COPY package*.json ./
RUN npm ci --only=production

# Копирование исходного кода
COPY . .

# Сборка TypeScript
RUN npm run build

# Создание папок
RUN mkdir -p uploads

# Открытие порта
EXPOSE 5000

# Запуск приложения
CMD ["npm", "start"]