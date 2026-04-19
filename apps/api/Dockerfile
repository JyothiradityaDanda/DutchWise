FROM node:20-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy shared package
COPY packages/shared ./packages/shared

# Copy API package
COPY apps/api/package.json apps/api/tsconfig.json ./apps/api/
COPY apps/api/prisma ./apps/api/prisma/
COPY apps/api/src ./apps/api/src/

WORKDIR /app/apps/api

# Install deps (npm workspace style)
RUN npm install --legacy-peer-deps
RUN npx prisma generate
RUN npx tsc

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
