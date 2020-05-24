# image runs the jest unit tests for js
FROM ubuntu:20.04 AS compile

RUN apt-get update -y
RUN apt-get install -y curl
RUN apt-get install -y gnupg2

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -

RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

RUN apt-get update -y

RUN apt-get -y install yarn

RUN yarn add --dev jest

#RUN apt-get install -y --no-install-recommends yarn

# RUN apk add git --no-cache

# ENV GO111MODULE on
# ENV WORKDIR /workdir/
# WORKDIR ${WORKDIR}

# COPY go.mod ${WORKDIR}
# COPY go.sum ${WORKDIR}
# RUN go mod download

# COPY . ${WORKDIR}
# RUN cd ${WORKDIR}; go install ./cmd/webserver

ENTRYPOINT ["jest"]

