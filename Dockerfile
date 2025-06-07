FROM node:18

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy manifest files first for caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy apps and packages
COPY apps ./apps
COPY packages ./packages

RUN pnpm install --frozen-lockfile

RUN pnpm build

CMD ["pnpm", "dev"]
