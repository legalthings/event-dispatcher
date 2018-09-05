FROM node:carbon-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

RUN npm build

RUN npm i pm2 -g

# Bundle app source
COPY . .

EXPOSE 80
CMD ["pm2-runtime", "dist/main.js"]
