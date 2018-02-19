FROM node:8.9.4

MAINTAINER jugal@bigbasket.com
# Create app directory

ENV NODE_ENV production

RUN mkdir -p /productservice
WORKDIR /productservice

# Install app dependencies
#COPY package.json /productservice
COPY package.json package.json
#RUN cd /productservice
RUN npm install && node --version
#&& npm cache clean
#RUN node --version

# Bundle app source
#COPY . /productservice
COPY . .

# container will receive packets with this port
EXPOSE 3000
CMD [ "npm", "start" ]
