FROM node:18.19-alpine3.18

# System setup
RUN apk add --no-cache bash=5.2.15-r5 make=4.4.1-r1 bubblewrap=0.8.0-r1
SHELL ["/bin/bash","-o", "pipefail","-l","-c"]

RUN echo | adduser normaluser --disabled-password
USER normaluser

WORKDIR /home/normaluser/

COPY --chown=normaluser . .

RUN yarn setup:canvas-packages
