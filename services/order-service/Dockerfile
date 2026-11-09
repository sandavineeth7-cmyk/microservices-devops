FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY server.js test.js ./
ENV NODE_ENV=production PORT=3003
EXPOSE 3003
USER node
CMD ["node", "server.js"]
