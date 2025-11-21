# ---- Builder stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy server and client folders into the builder
COPY server/ ./server/
COPY client/ ./client/

# Install server dependencies and build client
# Use `npm install` because `npm ci` requires a lockfile which isn't present in this repo.
RUN cd server && npm install --omit=dev
RUN cd client && npm install && npm run build

# ---- Production stage ----
FROM node:20-alpine

WORKDIR /app

# Set the port environment variable; Railway will override with its own $PORT at runtime
ENV PORT=5000

# Copy built client and server from builder stage
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/server/node_modules ./server/node_modules

# Copy root package.json so `npm run` works if needed
COPY package.json ./

# Expose the default server port (the container will use the PORT env Railway supplies)
EXPOSE 5000

# Start the server (it reads process.env.PORT)
CMD ["node","server/index.js"]
