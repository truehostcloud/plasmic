# Need newer alpine for bubblewrap to work
FROM node:18.19-alpine3.18 AS builder

# System setup
RUN apk add --no-cache bash=5.2.15-r5 make=4.4.1-r1 bubblewrap=0.8.0-r1
SHELL ["/bin/bash","-o", "pipefail","-l","-c"]

RUN echo | adduser normaluser --disabled-password
USER normaluser

WORKDIR /home/normaluser/

COPY --chown=normaluser . .

ARG COMMIT_HASH
ENV COMMIT_HASH=$COMMIT_HASH
ARG REACT_APP_DEFAULT_HOST_URL
ENV REACT_APP_DEFAULT_HOST_URL=$REACT_APP_DEFAULT_HOST_URL
ARG REACT_APP_DEV_HOST_PROXY
ENV REACT_APP_DEV_HOST_PROXY=$REACT_APP_DEV_HOST_PROXY

RUN yarn setup && yarn setup:canvas-packages

WORKDIR /home/normaluser/platform/wab/

RUN REACT_APP_DEFAULT_HOST_URL=$REACT_APP_DEFAULT_HOST_URL yarn build

FROM nginx:1.26.2-alpine

COPY --from=builder /home/normaluser/platform/wab/build /usr/share/nginx/html
