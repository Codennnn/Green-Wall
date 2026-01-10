# Green-Wall Next.js Application
# Supports both development and production environments

# Base stage: install pnpm and set up common configuration
FROM node:22-alpine AS base

# Install libc6-compat for npm package compatibility
RUN apk add --no-cache libc6-compat

# Enable corepack and setup pnpm
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && \
    corepack prepare pnpm@9.15.3 --activate

WORKDIR /app

# Set pnpm store directory for caching
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Dependencies stage: install all dependencies
FROM base AS deps

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline

# Production dependencies stage: install only production dependencies
FROM base AS deps-prod

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline --prod

# Development stage: for local development with hot reload
FROM base AS development

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 8000

ENV NODE_ENV=development
ENV HOSTNAME="0.0.0.0"
ENV PORT=8000

# Note: development uses root user to avoid volume mount permission issues
# Production environment uses non-root user for security

CMD ["pnpm", "dev"]

# Builder stage: compile production version
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time environment variable (can be overridden via --build-arg)
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

# Production stage: minimal runtime image
FROM base AS production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

COPY --from=deps-prod /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json

# For standalone output mode, use:
# COPY --from=builder /app/.next/standalone ./
# COPY --from=builder /app/.next/static ./.next/static
# COPY --from=builder /app/public ./public

# Create cache directory and set permissions for ISR
RUN mkdir -p .next/cache && chown -R nextjs:nodejs .next

USER nextjs

EXPOSE 3000

CMD ["pnpm", "start"]
