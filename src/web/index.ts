import { serve } from "bun";
import index from "./frontend/index.html";
import networksAPI from "./backend/api/networks";
import signatureAPI from "./backend/api/exit-params";

const server = serve({
  port: 3000,
  routes: {
    "/*": index,
    "/api/networks": networksAPI,
    "/api/exit-params/:networkURL/:bridgeAddress/:entryIdx/:entryTxHash":
      signatureAPI,
  },

  development: process.env.NODE_ENV !== "production",
});

console.log(`🚀 Client running at ${server.url}`);
