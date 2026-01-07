# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json ./

# Instalar todas as dependências (incluindo devDependencies para build)
RUN npm ci

# Copiar código fonte
COPY . .

# Build do frontend e backend
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copiar apenas package.json e package-lock.json
COPY package.json package-lock.json ./

# Instalar apenas dependências de produção
RUN npm ci --only=production && \
    npm cache clean --force

# Copiar arquivos buildados do stage anterior
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/shared ./shared

# Copiar templates de email se necessário
COPY --from=builder /app/server/templates ./server/templates

# Nota: O serveStatic usa path.resolve(import.meta.dirname, "public")
# Quando executado como dist/index.js, import.meta.dirname será "dist/"
# Então ele procura "dist/public", que é onde o Vite builda os arquivos estáticos

# Mudar ownership para usuário não-root
RUN chown -R nodejs:nodejs /app

USER nodejs

# Expor porta (ajuste conforme necessário)
EXPOSE 5000

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando para iniciar a aplicação
CMD ["node", "dist/index.js"]

