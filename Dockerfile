FROM oven/bun:1.2.10

WORKDIR /app
COPY . .
RUN bun install

CMD ["bun", "start"]
