import { serve } from "bun";
import index from "./frontend/index.html";
import networksAPI from "./backend/api/networks";

const server = serve({
  port: 3000,
  routes: {
    "/*": index,
    "/api/networks": networksAPI,
  },

  development: process.env.NODE_ENV !== "production",
});

console.log(`🚀 Client running at ${server.url}`);
