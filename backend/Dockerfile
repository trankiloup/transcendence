FROM node:18.18

EXPOSE 4200

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

# RUN npm install --save @nestjs-modules/mailer nodemailer@6.9.7

CMD [ "npm", "run", "start:dev" ]