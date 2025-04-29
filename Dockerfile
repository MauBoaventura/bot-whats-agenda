# Etapa 1: Build da aplicação
FROM node:20-slim AS builder

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar arquivos de configuração e instalar dependências
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

# Copiar todo o código-fonte e compilar
COPY . .
RUN pnpm run build

# Etapa 2: Imagem final (produção)
FROM node:20-slim

WORKDIR /app

# Instalar Chromium e dependências
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libnss3 \
    libxss1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    wget \
    ca-certificates \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Instalar pnpm e dependências de produção
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install --prod

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=4000
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Copiar código compilado
COPY --from=builder /app/dist ./dist
COPY .env* ./

# Comando para iniciar a aplicação
CMD ["sh", "-c", "if [ -f .env ]; then export $(cat .env | grep -v '^#' | xargs); fi && node dist/main"]
