# Estágio 0: Base
FROM node:24-alpine as base
WORKDIR /usr/src/app
COPY package*.json ./

# Estágio 1: Desenvolvimento
FROM base as development
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]

# Estágio 2: Builder
FROM base as builder
RUN npm ci --omit=dev && npm cache clean --force

# Estágio 3: Produção
FROM node:24-alpine as production
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY . .
USER node
EXPOSE 3000
CMD ["npm", "start"]