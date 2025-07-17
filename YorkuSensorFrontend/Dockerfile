# frontend/Dockerfile (with pnpm)
FROM node:18

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy everything and install dependencies
COPY . .

RUN pnpm install
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
