FROM oven/bun:1.2.10

WORKDIR /app
COPY . ./
RUN bun install

ENV NODE_ENV=production
CMD ["bun", "start"]
