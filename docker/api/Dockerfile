FROM ubuntu:16.04 as intermediate
# install git just for the sake of cloning bb-logger as its a dependency for
# product service
RUN apt-get clean && apt-get update && apt-get install -y git

# add credentials on build
ARG GIT_USERNAME
ARG GIT_PASSWORD
RUN mkdir /root/.ssh/

# make sure your domain is accepted
RUN touch /root/.ssh/known_hosts
RUN ssh-keyscan github.com >> /root/.ssh/known_hosts
RUN git clone -v --branch prodstable --depth 1 https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/BigBasket/bb-logger

FROM node:8.11.1

MAINTAINER megaminds@bigbasket.com
# Create app directory

ENV NODE_ENV production
RUN mkdir -p /product
WORKDIR /product
RUN mkdir logs

COPY --from=intermediate /bb-logger /bb-logger

# Install app dependencies
#COPY package.json /productservice
COPY package.json package.json
#RUN cd /productservice
RUN npm install --production && node --version

RUN npm link /bb-logger/
#&& npm cache clean
#RUN node --version

# Bundle app source
#COPY . /productservice
COPY . .

# container will receive packets with this port
EXPOSE 32001
ENV PORT 32001
CMD [ "npm", "start" ]