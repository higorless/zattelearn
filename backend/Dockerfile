FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/dist ./dist
COPY package.json tsconfig.json ./

EXPOSE 3001

CMD ["sh", "-c", "node -r ts-node/register src/migrate.ts && node dist/index.js"]
