FROM node:20 As build

# Install specific versions of npm and yarn
RUN npm install -g npm@10.5.2
RUN npm install -g yarn@1.22.19

# Create app directory
WORKDIR /usr/src

# Install app dependencies
COPY package.json yarn.lock ./

RUN yarn

# Bundle app source
COPY . .

RUN yarn version --new-version $(git describe --tags) --no-git-tag-version

RUN yarn build

FROM node:20-alpine
# Move the build files from build folder to app folder
WORKDIR /usr/app

RUN yarn global add pm2

COPY package.json yarn.lock ./
RUN yarn --production

COPY --from=build /usr/src/dist ./

EXPOSE 3000
CMD ["pm2-runtime", "main.js"]
