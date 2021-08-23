from node:alpine

ARG NPM_TOKEN

workdir /app

copy .npmrc .
run echo //npm.pkg.github.com/:_authToken=${NPM_TOKEN} >> .npmrc

copy package.json .

run npm install --only=prod
copy . .

cmd ["npm", "start"]