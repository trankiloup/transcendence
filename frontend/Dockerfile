FROM node:18.18

EXPOSE 3000

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

RUN npm install ngx-socket-io@4.5.1

CMD [ "npm", "start", "--watch" ]
