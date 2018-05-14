FROM node:8.9.4

MAINTAINER megaminds@bigbasket.com
# Create app directory

ENV NODE_ENV production

RUN mkdir -p /product
WORKDIR /product

# Install app dependencies
RUN pwd as
COPY package.json package.json
RUN npm install --production && node --version

COPY . .

CMD [ "node", "kafka/consumer.js" ]
