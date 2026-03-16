FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN apk add --no-cache curl
RUN npm install

COPY . .

EXPOSE 4003

CMD [ "node", "server.js" ]
