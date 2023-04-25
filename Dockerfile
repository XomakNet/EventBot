FROM node:20-alpine3.16

RUN apk update

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

COPY src /app/src

RUN ls -a

RUN npm install
RUN npm run build

EXPOSE 7777

CMD [ "node", "./src/main.js" ]