##
# construire l'image:
# docker build . -t aerogus/sablier-des-sorciers
#
# lancer l'image
# docker run -p 80:80 -d aerogus/sablier-des-sorciers
#
# Ref: https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
##

FROM node:14
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 80
CMD [ "node", "server.js" ]
