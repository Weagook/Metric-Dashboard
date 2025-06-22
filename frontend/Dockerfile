# Stage 1: сборка приложения
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: запуск через nginx
FROM nginx:alpine

# Копируем билд в стандартную директорию nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем кастомный конфиг nginx (если нужен, ниже пример)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]