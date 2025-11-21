# ---- Builder stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy server and client package files (including lockfiles)
COPY server/ ./server/
COPY client/ ./client/

# Install server dependencies (npm install works without lockfile)
RUN cd server && npm install
# Install client dependencies and build
RUN cd client && npm install && npm run build

# ---- Production stage ----
FROM node:20-alpine

WORKDIR /app

# Copy built client and server code
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server ./server
# Copy server's production node_modules from builder stage
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY server/package.json ./
COPY Procfile ./
# Copy root package.json (contains prod script)
COPY package.json ./
# Install root deps (none, but ensures npm can find scripts)
RUN npm install --omit=dev

EXPOSE 8080

CMD ["npm","run","prod"]
