

# build container image from container manifest file
.PHONY: build
build:
	docker build -t mula-alpha -f ./build/Dockerfile .


# build container image from container manifest file
.PHONY: buildt
buildt:
	@docker build -q -t dorie-test -f ./build/test/Dockerfile . > /dev/null


# build container image from container manifest file
# docker run -it -v "$(pwd)":/dorie dorie-test
.PHONY: runt
runt:
	@docker run -it dorie-test


# build container image from container manifest file
.PHONY: test
test: buildt runt


# run container based on an image
.PHONY: run
run:
	docker run --restart=always -d -p "80:80" mula-alpha


# run container for dev local based on an image
.PHONY: rundev
rundev:
	docker run --rm  -d -p "80:80" --name api mula-alpha


# run service on local docker env for development
.PHONY: serve
serve: clear-docker build rundev


# ssh to digital ocean
.PHONY: access
# call like: make access ip=64.225.104.7
access:
	ssh -t root@$(ip) "cd /$(dir) ; bash"


# deploy from local with production config to remote
# just select ip address from digital ocean droplet
.PHONY: deploy
 # call like: make deploy dir=$(pwd) ip=64.225.104.7
 deploy: prep-do
	ssh root@$(ip) "cd /mula; make build clear-docker run"


# prepare droplet on digital ocean from remote
 .PHONY: prep-do
 # call like: make prep-do dir=$(pwd) ip=64.225.104.7
 prep-do: clear-tmp
	ssh root@$(ip) "apt-get update; apt-get -y upgrade; apt-get -y install docker.io; systemctl start docker; systemctl enable docker"
	#ssh root@$(ip) "mkdir viewcrypt"
	rsync -v --archive --delete --exclude=.git* --compress $(dir) root@$(ip):/
	#scp -r $(dir) root@$(ip):/
	ssh root@$(ip) "apt-get -y install make"


# get shell inside of the first running docker container
 .PHONY: login
 # call like: make login
 login:
	docker exec -it `docker ps -a -q | head -n 1` /bin/sh


# get shell inside of a stoped docker container
 .PHONY: loginforce
 # call like: make loginforce
 loginforce:
	docker run -it --entrypoint /bin/sh `docker ps -a -q | head -n 1` -s


# stop and remove all docker container
.PHONY: clear-docker
# call like: make deploy dir=$(pwd) ip=64.225.104.7
clear-docker:
	-docker stop `docker ps -a -q` 2>/dev/null
	-docker rm `docker ps -a -q` 2>/dev/null
	#docker system prune -f


# remove temp files
.PHONY: clear-tmp
clear-tmp:
	find . -type f -name '*.tmp.*' -print0 | xargs -0 rm
	find . -type f -name 'vcrypt*' -print0 | xargs -0 rm
	find . -type f -name '*.test' -print0 | xargs -0 rm

