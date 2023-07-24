FROM node:20-alpine3.16 as builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm install

COPY src /app/src

RUN npm run build

FROM node:20-alpine3.16

WORKDIR /app

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/src/*.js /app/src/

CMD [ "node", "./src/main.js" ]
