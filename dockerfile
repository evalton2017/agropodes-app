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

COPY --from=build /app/dist/agroprodes-app /app/dist/agroprodes-app
COPY package*.json ./
RUN npm ci --omit=dev

EXPOSE 4200
CMD ["node", "dist/agroprodes-app/server/server.mjs"]
