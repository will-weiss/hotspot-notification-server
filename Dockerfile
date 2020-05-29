FROM node:14.2.0
WORKDIR /usr/hotspot-notification-server


# RUN apt-get update && apt-get install -y postgresql

# Install npm dependencies after copying in package.json
COPY package.json .
RUN npm install

# Copy in source files, lint, compile, test & remove devDependencies
COPY knexfile.js .
COPY tsconfig.json .
COPY tslint.json .
COPY test_setup.js .
COPY public/ /usr/hotspot-notification-server/public
COPY views/ /usr/hotspot-notification-server/views
COPY src/ /usr/hotspot-notification-server/src

RUN npm run lint
RUN npm run compile

# RUN npm test
# RUN npm prune production

CMD ["node", "compiled/entry.js"]
