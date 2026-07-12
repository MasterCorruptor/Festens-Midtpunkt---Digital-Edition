FROM node:24-alpine

WORKDIR /app

COPY server/package*.json ./server/

WORKDIR /app/server

RUN npm ci --omit=dev

WORKDIR /app

COPY . .

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD ["node", "-e", "const value = Number(process.env.PORT); const port = Number.isInteger(value) && value >= 1 && value <= 65535 ? value : 3000; fetch('http://127.0.0.1:' + port + '/api/decks').then(response => { if (!response.ok) process.exit(1); }).catch(() => process.exit(1))"]

CMD ["node", "server/server.js"]
