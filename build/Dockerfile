# 1st image is going to be our build image
FROM golang:1.13.5-alpine3.11 AS compile

RUN apk add git --no-cache

ENV GO111MODULE on
ENV WORKDIR /workdir/
WORKDIR ${WORKDIR}

COPY go.mod ${WORKDIR}
COPY go.sum ${WORKDIR}
RUN go mod download

COPY . ${WORKDIR}
RUN cd ${WORKDIR}; go install ./cmd/webserver


# 2nd image is going to be our application image
FROM alpine:3.11 as app

RUN mkdir -p mula/website
COPY website /mula/website

COPY --from=compile /go/bin/webserver /
RUN chmod +x /webserver

ENTRYPOINT ["/bin/sh", "-c", "/webserver -d /mula/website >> /server.log 2>&1"]
