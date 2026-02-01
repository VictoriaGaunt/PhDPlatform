FROM node:18-alpine

WORKDIR /app

# Устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Копируем исходный код
COPY . .

# Открываем порт
EXPOSE 5000

# Запуск в режиме разработки
CMD ["npm", "run", "dev"]