FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependency files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy remaining files
COPY . .

# Build TypeScript application
RUN pnpm build

# Expose port
EXPOSE 3000

# Run the application
CMD ["pnpm", "start"]