# build container image from container manifest file
.PHONY: buildt
buildt:
	@docker build -q -t 11sense-test -f ./build/container-image-test/Dockerfile . > /dev/null


# build container image from container manifest file
# docker run -it -v "$(pwd)":/11sense 11sense-test
.PHONY: runt
runt:
	@docker run -it 11sense-test


# build container image from container manifest file
.PHONY: test
test: buildt runt


# run sass conversion
sass:
	cd build/container-image-sass; docker build -t sass .
	cat website/app/styles/themes/bright.scss | docker run -i sass > website/app/styles/themes/bright.css
	cat website/app/styles/themes/dark.scss | docker run -i sass > website/app/styles/themes/dark.css