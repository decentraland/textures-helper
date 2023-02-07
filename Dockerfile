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
RUN apt-get -y -qq install python-setuptools build-essential

# We use Tini to handle signals and PID1 (https://github.com/krallin/tini, read why here https://github.com/krallin/tini/issues/8)
ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini

# install yarn
RUN apt-get update
RUN apt-get install -y gnupg curl
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update
RUN apt-get install -y yarn

# update nodejs
RUN curl -sL https://deb.nodesource.com/setup_19.x | bash -
RUN apt-get install -y nodejs

# install dependencies
COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock
RUN yarn install --frozen-lockfile

# build the app
COPY . /app
RUN yarn run build
RUN yarn run test

# remove devDependencies, keep only used dependencies
RUN yarn install --frozen-lockfile

########################## END OF BUILD STAGE ##########################

FROM node:lts

# NODE_ENV is used to configure some runtime options, like JSON logger
ENV NODE_ENV production

WORKDIR /app
COPY --from=builderlibrary /app/crunch/crnlib/crunch /usr/local/bin/
COPY --from=builderenv /app /app
COPY --from=builderenv /tini /tini

# Please _DO NOT_ use a custom ENTRYPOINT because it may prevent signals
# (i.e. SIGTERM) to reach the service
# Read more here: https://aws.amazon.com/blogs/containers/graceful-shutdowns-with-ecs/
#            and: https://www.ctl.io/developers/blog/post/gracefully-stopping-docker-containers/
ENTRYPOINT ["/tini", "--"]
# Run the program under Tini
CMD [ "/usr/local/bin/node", "--trace-warnings", "--abort-on-uncaught-exception", "--unhandled-rejections=strict", "dist/index.js" ]
