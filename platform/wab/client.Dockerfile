# Need newer alpine for bubblewrap to work
FROM node:18.19-alpine3.18 AS builder

# System setup
RUN apk add --no-cache bash=5.2.15-r5 make=4.4.1-r1 bubblewrap=0.8.0-r1 tree==2.1.1-r0
SHELL ["/bin/bash","-o", "pipefail","-l","-c"]

RUN echo | adduser normaluser --disabled-password
USER normaluser

WORKDIR /home/normaluser/

COPY --chown=normaluser . .

RUN tree -L 2

ARG COMMIT_HASH
ENV COMMIT_HASH=$COMMIT_HASH

RUN yarn setup

WORKDIR /home/normaluser/platform/plasmic/wab/

RUN pwd && tree -L 2 && yarn build && tree -L 2

FROM nginx:1.26.2-alpine

COPY --from=builder /home/normaluser/plasmic/dist /usr/share/nginx/html
