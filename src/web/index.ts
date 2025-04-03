import { serve } from "bun";
import index from "./frontend/index.html";

const server = serve({
  port: 3000,
  routes: {
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production",
});

console.log(`🚀 Client running at ${server.url}`);
