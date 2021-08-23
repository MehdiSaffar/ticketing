from node:alpine

workdir /app
copy package.json .
run npm install --only=prod
copy . .

cmd ["npm", "start"]