import { serve } from "bun";
import index from "./index.html";

const server = serve({
  port: 3000,
  routes: {
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production",
});

console.log(`🚀 Frontend running at ${server.url}`);
