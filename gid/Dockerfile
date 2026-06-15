FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY src/ ./src/
COPY tsconfig.json ./

CMD ["node_modules/.bin/tsx", "src/gid.ts"]
