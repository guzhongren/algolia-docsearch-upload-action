FROM alpine:latest
ADD https://github.com/algolia/cli/releases/download/v1.2.0/algolia_1.2.0_linux_amd64.tar.gz ./algolia_1.2.0_linux_amd64.tar.gz
RUN tar -xvf ./algolia_1.2.0_linux_amd64.tar.gz
RUN mv ./algolia_1.2.0_linux_amd64/algolia /usr/local/bin/
COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
