# FreshFold — container image
# Works on Fly.io, Railway, a VPS, or anything that runs Docker.
# Zero dependencies, so the image is tiny and builds in seconds.

FROM node:20-alpine

WORKDIR /app

# No dependencies to install — package.json is copied for npm start metadata
COPY package.json ./
COPY server.js ./
COPY public ./public

# Booking data lives outside the app folder so it can be mounted as a volume.
# chown is essential: the container runs as the non-root "node" user, and without
# it that user can't write to /data and bookings would silently fail.
ENV NODE_ENV=production \
    DATA_DIR=/data \
    PORT=3000
RUN mkdir -p /data && chown node:node /data
VOLUME ["/data"]

EXPOSE 3000

# Runs as the non-root user that ships with the node image
USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]
