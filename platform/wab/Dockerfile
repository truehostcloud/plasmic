ARG CANVAS_PACKAGES_IMAGE_REF

FROM $CANVAS_PACKAGES_IMAGE_REF AS canvas-packages

# Need newer alpine for bubblewrap to work
FROM node:18.19-alpine3.18

# System setup
RUN apk add --no-cache bash=5.2.15-r5 make=4.4.1-r1 bubblewrap=0.8.0-r1
SHELL ["/bin/bash","-o", "pipefail","-l","-c"]

RUN echo | adduser normaluser --disabled-password
USER normaluser

WORKDIR /home/normaluser/

COPY --chown=normaluser wab/package.json wab/yarn.lock plasmic/
WORKDIR /home/normaluser/plasmic/

# For local tests:
# COPY --chown=normaluser pgpass /home/normaluser/.pgpass
# RUN chmod 600 /home/normaluser/.pgpass

RUN yarn install --frozen-lockfile && yarn cypress cache clear

COPY --chown=normaluser wab .

# Run make, but touch src/wab/client/plasmic-deployed.json so it
# doesn't get made (see above)
RUN mkdir -p src/wab/gen/ && touch src/wab/client/plasmic-deployed.json && make

RUN rm -rf ./node_modules
RUN yarn install --production --frozen-lockfile && yarn cache clean

COPY --chown=normaluser wab/tools/docker-dev/secrets.json /home/normaluser/.plasmic/secrets.json
RUN chmod 600 ~/.plasmic/secrets.json

# loader-bundle-env is expected to be a peer folder to wab, so we copy it there
COPY --chown=normaluser loader-bundle-env /home/normaluser/loader-bundle-env
WORKDIR /home/normaluser/loader-bundle-env
RUN yarn install && yarn cache clean

# loader-html-hydrate is expected to be a peer folder to wab, so we copy it there
COPY --chown=normaluser loader-html-hydrate /home/normaluser/loader-html-hydrate
WORKDIR /home/normaluser/loader-html-hydrate

ARG REACT_APP_DEFAULT_HOST_URL
ENV REACT_APP_DEFAULT_HOST_URL=$REACT_APP_DEFAULT_HOST_URL

RUN yarn install && REACT_APP_DEFAULT_HOST_URL=$REACT_APP_DEFAULT_HOST_URL yarn build && yarn cache clean

# Expose main server port
EXPOSE 3004

# Switch workdir back to wab
WORKDIR /home/normaluser/plasmic

COPY --from=canvas-packages /home/normaluser/canvas-packages/build-server/ /home/normaluser/canvas-packages/build-server/

# Run the main server by default
CMD ["yarn", "backend"]
