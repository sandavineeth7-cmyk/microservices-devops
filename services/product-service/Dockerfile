FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY server.js test.js ./
ENV NODE_ENV=production PORT=3002
EXPOSE 3002
USER node
CMD ["node", "server.js"]
