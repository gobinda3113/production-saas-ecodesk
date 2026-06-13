# ── Base dependencies (cached until package files change) ──
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY server/package.json ./server/
RUN npm ci
RUN npx prisma generate

# ── API server build ──
FROM deps AS api-build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY . .
RUN npm run build:server

# ── API server runtime ──
FROM node:22-alpine AS api
WORKDIR /app
COPY --from=api-build /app/server/dist ./server/dist
COPY --from=api-build /app/node_modules ./node_modules
COPY --from=api-build /app/prisma ./prisma
COPY --from=api-build /app/package.json ./
EXPOSE 3001
CMD ["node", "server/dist/index.js"]

# ── Frontend build ──
FROM deps AS web-build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ── Frontend runtime (nginx) ──
FROM nginx:stable-alpine AS web
COPY --from=web-build /app/dist /usr/share/nginx/html
COPY scripts/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
