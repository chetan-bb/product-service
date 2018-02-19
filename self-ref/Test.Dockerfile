FROM jugaljoshi/imagename

ENV NODE_ENV development

RUN npm install

# use nodemon for development
RUN npm install nodemon -g


CMD [ "nodemon", "./bin/www"]



