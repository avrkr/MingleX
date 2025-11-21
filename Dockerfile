# ---- Builder stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy server and client package files
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install server dependencies
RUN cd server && npm ci
# Install client dependencies and build
RUN cd client && npm ci && npm run build

# ---- Production stage ----
FROM node:20-alpine

WORKDIR /app

# Copy built client and server code
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server ./server
COPY server/package.json ./
COPY Procfile ./

EXPOSE 8080

CMD ["npm","run","prod"]
