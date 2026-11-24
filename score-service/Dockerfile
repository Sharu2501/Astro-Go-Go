FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
COPY scoring.js server.js ./

ENV PORT=3000
EXPOSE 3000
USER node

CMD ["node", "server.js"]