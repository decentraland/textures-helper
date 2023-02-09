ARG RUN

FROM amd64/ubuntu as builderlibrary

WORKDIR /app

RUN apt-get update
RUN apt-get -y -qq install make build-essential git

RUN git clone https://github.com/BinomialLLC/crunch.git
RUN ls && cd crunch/crnlib && make

FROM amd64/ubuntu as builderenv

WORKDIR /app

# some packages require a build step
RUN apt-get update
RUN apt-get -y -qq install python-setuptools build-essential gnupg curl

# We use Tini to handle signals and PID1 (https://github.com/krallin/tini, read why here https://github.com/krallin/tini/issues/8)
ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini

# add yarn and nodejs repositories
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash -

# update nodejs
RUN apt-get update
RUN apt-get install -y nodejs yarn

# install dependencies
COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock
RUN yarn install --frozen-lockfile

# build the app
COPY . /app
RUN yarn run build
RUN yarn run test

# remove devDependencies, keep only used dependencies
RUN yarn install --prod --frozen-lockfile

ARG COMMIT_HASH
RUN echo "COMMIT_HASH=$COMMIT_HASH" >> .env

########################## END OF BUILD STAGE ##########################

# FROM node:lts WIP
FROM amd64/ubuntu

# NODE_ENV is used to configure some runtime options, like JSON logger
ENV NODE_ENV production

WORKDIR /app
COPY --from=builderlibrary /app/crunch/crnlib/crunch /usr/local/bin/
COPY --from=builderenv /app /app
COPY --from=builderenv /tini /tini

RUN apt-get update
RUN apt-get -y -qq install make build-essential curl

RUN curl -sL https://deb.nodesource.com/setup_18.x | bash -

RUN apt-get update
RUN apt-get install -y nodejs

# Please _DO NOT_ use a custom ENTRYPOINT because it may prevent signals
# (i.e. SIGTERM) to reach the service
# Read more here: https://aws.amazon.com/blogs/containers/graceful-shutdowns-with-ecs/
#            and: https://www.ctl.io/developers/blog/post/gracefully-stopping-docker-containers/
ENTRYPOINT ["/tini", "--"]
# Run the program under Tini
CMD [ "node", "--trace-warnings", "--abort-on-uncaught-exception", "--unhandled-rejections=strict", "dist/index.js" ]
