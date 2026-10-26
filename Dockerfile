# syntax=docker/dockerfile:1

# Imagem de produção do GoncadasVendas: build em várias etapas, para a imagem final ficar pequena.
# Variáveis exigidas ao rodar: DATABASE_URL, NEXTAUTH_SECRET e NEXTAUTH_URL.
# Opcional: APPLICATIONINSIGHTS_CONNECTION_STRING (liga o monitoramento).

FROM node:20-alpine AS base
# openssl: o Prisma precisa dele no Alpine.
RUN apk add --no-cache openssl
WORKDIR /app

# 1) Dependências (com as de desenvolvimento, que o build precisa).
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# 2) Build do Next.js. O prisma generate cria o cliente para o Linux da própria imagem.
FROM base AS build
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# 3) Imagem final: só o servidor enxuto, rodando sem ser root.
FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs

COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public

# O servidor enxuto não traz a ferramenta de migrations: copiamos a CLI do Prisma (mesma versão do lock).
COPY --from=build --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs
EXPOSE 3000

# O Docker marca o container como "unhealthy" se o app ou o banco pararem de responder.
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:3000/api/health || exit 1

# Aplica as migrations pendentes e só então sobe o servidor (se a migration falhar, o container não sobe).
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && node server.js"]
