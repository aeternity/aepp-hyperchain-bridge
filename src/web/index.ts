import { serve } from "bun";

import index from "./frontend/index.html";
import historyAPI from "./backend/api/history";
import networksAPI from "./backend/api/networks";
import signatureAPI from "./backend/api/signature";
import syncActions from "./backend/job/sync-actions";

await syncActions();

const server = serve({
  port: 3000,
  routes: {
    "/*": index,
    "/api/networks": networksAPI,
    "/api/history/:userAddress": historyAPI,
    "/api/signature/:networkURL/:bridgeAddress/:entryIdx/:entryTxHash":
      signatureAPI,
  },

  development: process.env.NODE_ENV !== "production",
});

console.log(`🚀 Client running at ${server.url}`);
