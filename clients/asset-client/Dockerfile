# Stage 1: Build ứng dụng
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./ 
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Chạy ứng dụng Production tối ưu
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=9797
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 9797

CMD ["node", "server.js"]