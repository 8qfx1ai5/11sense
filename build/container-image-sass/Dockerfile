# image for scss compiling
FROM alpine:3.12 AS sass

# install sass
RUN apk add --update npm --no-cache
RUN npm install -g sass

ENTRYPOINT ["sass", "--stdin"]