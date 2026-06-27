# Node 24 ships node:sqlite usable without an experimental flag (and bundles the
# engine, so musl/alpine is fine — no native build needed).
FROM node:24-alpine
WORKDIR /app

# Install production dependencies only.
COPY package*.json ./
RUN npm install --omit=dev

# App source.
COPY . .

ENV NODE_ENV=production
EXPOSE 4000

# On boot: apply schema + seed the demo user only if the DB is empty, then start.
CMD ["sh", "-c", "node src/db/ensure-seed.js && node src/index.js"]
