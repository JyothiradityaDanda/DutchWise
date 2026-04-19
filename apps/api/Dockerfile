FROM node:20-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy shared package
COPY packages/shared/ ./packages/shared/

# Copy API package
COPY apps/api/package.json ./apps/api/
COPY apps/api/prisma/ ./apps/api/prisma/
COPY apps/api/src/ ./apps/api/src/
COPY apps/api/tsconfig.json ./apps/api/

WORKDIR /app/apps/api

# Install all deps (including devDeps for tsx runtime)
RUN npm install

# Generate Prisma client
RUN npx prisma generate

EXPOSE 4000

# Use tsx to run TypeScript directly — avoids build/path-resolution issues
CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx src/index.ts"]
