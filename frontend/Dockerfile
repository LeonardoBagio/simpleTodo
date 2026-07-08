# Estágio 0: Base
FROM node:24-alpine as base
WORKDIR /usr/src/app
COPY package*.json ./

# Estágio 1: Desenvolvimento
FROM base as development
RUN npm install
COPY . .
# Expondo a rede do Vite para o Docker
CMD ["npm", "run", "dev", "--", "--host"]

# Estágio 2: Builder
FROM base as builder
RUN npm install
COPY . .
RUN npm run build

# Estágio 3: Produção (Servido via Nginx)
FROM nginx:alpine as production
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]