# Need newer alpine for bubblewrap to work
FROM node:18.19-alpine3.18 as builder

# System setup
RUN apk add --no-cache bash=5.2.15-r5 make=4.4.1-r1 bubblewrap=0.8.0-r1
SHELL ["/bin/bash","-o", "pipefail","-l","-c"]

RUN echo | adduser normaluser --disabled-password
USER normaluser

WORKDIR /home/normaluser/

COPY --chown=normaluser wab/package.json wab/yarn.lock plasmic/wab/
WORKDIR /home/normaluser/plasmic/wab/

RUN yarn install --frozen-lockfile && yarn cypress cache clear

WORKDIR /home/normaluser/plasmic/

COPY --chown=normaluser . .

ARG COMMIT_HASH
ENV COMMIT_HASH=$COMMIT_HASH

WORKDIR /home/normaluser/plasmic/wab/

RUN yarn build && ls -la /home/normaluser/plasmic/

FROM nginx:3.20-alpine

COPY --from=builder /home/normaluser/plasmic/dist /usr/share/nginx/html