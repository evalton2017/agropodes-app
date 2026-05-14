# Estágio 1: Build da aplicação
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build --configuration=production

# Estágio 2: Ambiente de execução (Runtime)
FROM node:22-alpine AS runtime
WORKDIR /app

# Copia mantendo o nome original do projeto definido no angular.json
COPY --from=build /app/dist/agroprodes /app/dist/agroprodes
COPY package*.json ./
RUN npm ci --omit=dev

EXPOSE 4000
CMD ["node", "dist/agroprodes/server/server.mjs"]
