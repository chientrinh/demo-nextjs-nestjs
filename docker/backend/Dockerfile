# ---- deps ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY backend/package*.json ./
COPY backend/prisma ./prisma/
RUN npm install

# ---- dev (watch mode) ----
FROM node:22-alpine AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY backend/package*.json ./
COPY backend/prisma ./prisma/
ENV NODE_ENV=development
ENV PORT=3001
EXPOSE 3001
CMD ["sh", "-c", "npx prisma generate && npm run start:dev"]

# ---- build ----
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY backend .
RUN npx prisma generate && npm run build

# ---- runtime (production) ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
COPY backend/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
