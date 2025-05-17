FROM node:18 As production
RUN mkdir -p /var/app
WORKDIR /var/app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3002
CMD [ "node", "dist/main.js" ]

FROM node:18 As development
RUN mkdir -p /var/app
WORKDIR /var/app
COPY . .
RUN npm install
EXPOSE 3002
CMD [ "npm", "run", "start:dev" ]