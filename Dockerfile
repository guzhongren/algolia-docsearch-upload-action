FROM node:lts-alpine
COPY ./ /
COPY ./ /github/workspace/
RUN npm install -g pnpm && pnpm install
# COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
