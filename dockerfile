FROM node:24-alpine

WORKDIR /app

COPY server/package*.json ./server/

WORKDIR /app/server

RUN npm install

WORKDIR /app

COPY . .

EXPOSE 3000

CMD ["node", "server/server.js"]