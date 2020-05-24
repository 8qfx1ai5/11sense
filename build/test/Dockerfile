# image runs the jest unit tests for js
FROM ubuntu:20.04 AS compile

# prepare system
RUN apt-get update -y
RUN apt-get upgrade -y
RUN apt-get install -y curl
RUN apt-get install -y gnupg2

# install node.js + npm
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get update -y
RUN apt-get install -y nodejs

# install jest globally
RUN npm install -g --save-dev jest

# prepare code
ENV WORKDIR /dorie
RUN mkdir -p ${WORKDIR}
WORKDIR ${WORKDIR}
COPY . ${WORKDIR}

ENTRYPOINT ["/bin/sh", "-c", "/usr/bin/npm --silent run test"]

