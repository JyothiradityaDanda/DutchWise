FROM node:20-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy shared package
COPY packages/shared/ ./packages/shared/

# Copy server
COPY server/package.json ./server/
COPY server/prisma/ ./server/prisma/
COPY server/src/ ./server/src/
COPY server/tsconfig.json ./server/

WORKDIR /app/server

RUN npm install
RUN npx prisma generate

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx src/index.ts"]
