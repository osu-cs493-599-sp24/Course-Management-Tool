FROM node:20

WORKDIR /usr/src/app

COPY wait-for-it.sh /usr/src/app/

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8000

# Command to run the app with wait-for-it
CMD ["./wait-for-it.sh", "mysql:3306", "--", "node", "server.js"]
