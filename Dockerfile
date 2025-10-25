FROM oven/bun:latest

WORKDIR /app

# Copy package files first (for better Docker layer caching)
COPY package.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY shared/package.json ./shared/

# Copy bun.lock files after package.json
COPY bun.lock ./
COPY server/bun.lock ./server/

# Install dependencies
RUN bun install

# Copy source code after installing dependencies (node_modules excluded by .dockerignore)
COPY . .

# Build for single origin
RUN bun run build:single

EXPOSE 3000

CMD ["bun", "run", "start:single"]