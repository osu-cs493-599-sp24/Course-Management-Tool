FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8000

CMD ["./wait-for-it.sh", "postgres:5432", "--", "npm", "run", "migrate", "&&", "npm", "start"]