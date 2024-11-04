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
ARG ADMIN_TEAM_DOMAIN
ENV REACT_APP_DEFAULT_HOST_URL=$REACT_APP_DEFAULT_HOST_URL
ARG REACT_APP_PUBLIC_URL
ENV REACT_APP_PUBLIC_URL=$REACT_APP_PUBLIC_URL
ENV PUBLIC_URL=$REACT_APP_PUBLIC_URL
ENV ADMIN_TEAM_DOMAIN=$ADMIN_TEAM_DOMAIN

RUN yarn setup && yarn setup:canvas-packages

WORKDIR /home/normaluser/platform/wab/

ENV NODE_ENV=production

RUN yarn build

FROM node:18.19-alpine3.18

RUN yarn add http-server@14.1.1

WORKDIR /home/normaluser/

COPY --from=builder /home/normaluser/platform/wab/build/ /home/normaluser/platform/wab/build/

EXPOSE 80

CMD ["npx", "http-server", "platform/wab/build", "-p", "80", "-d", "false"]
