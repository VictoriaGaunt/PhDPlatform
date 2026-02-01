FROM node:18-alpine

WORKDIR /app

# Установка зависимостей
COPY package*.json ./
RUN npm install

# Копирование исходного кода
COPY . .

# Открытие порта
EXPOSE 3000

# Запуск в режиме разработки
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]