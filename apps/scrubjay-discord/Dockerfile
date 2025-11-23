# Base stage: Set up Node.js and pnpm
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN apk add --no-cache libc6-compat && \
    corepack enable && \
    pnpm install turbo --global

FROM base AS builder
WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml* ./
COPY . .
RUN turbo prune scrubjay --docker

FROM base AS installer
WORKDIR /usr/src/app
COPY .gitignore .gitignore
COPY --from=builder /usr/src/app/out/json/ .
COPY --from=builder /usr/src/app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /usr/src/app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /usr/src/app/out/full/ .

RUN pnpm install --frozen-lockfile
COPY turbo.json turbo.json
RUN turbo run build --filter=scrubjay

FROM node:22-alpine as runner

WORKDIR /usr/src/app
 
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs
 
# Copy root workspace files and node_modules (contains hoisted dependencies)
COPY --from=installer --chown=nodejs:nodejs /usr/src/app/package.json ./package.json
COPY --from=installer --chown=nodejs:nodejs /usr/src/app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=installer --chown=nodejs:nodejs /usr/src/app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=installer --chown=nodejs:nodejs /usr/src/app/node_modules ./node_modules

# Copy the entire app directory (includes dist, node_modules, and source files like drizzle migrations)
COPY --from=installer --chown=nodejs:nodejs /usr/src/app/apps/scrubjay ./apps/scrubjay
 
USER nodejs
WORKDIR /usr/src/app/apps/scrubjay
CMD ["node", "dist/src/main.js"]