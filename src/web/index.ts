import { serve } from "bun";

import index from "./frontend/index.html";
import networks from "./backend/api/networks";
import signature from "./backend/api/signature";
import syncActions from "./backend/job/sync-actions";
import verifyNetwork from "./backend/api/verify-network";
import * as actions from "./backend/api/actions";

await syncActions();

const server = serve({
  port: Bun.env.PORT || 3000,
  routes: {
    "/*": index,
    "/api/networks": networks,
    "/api/networks/verify": verifyNetwork,
    "/api/actions/:userAddress": actions.byUserAddress,
    "/api/action/:sourceNetworkId/:entryIdx": actions.byNetworkIdAndEntryIdx,
    "/api/signature/:networkURL/:bridgeAddress/:entryIdx/:entryTxHash":
      signature,
  },

  development: process.env.NODE_ENV !== "production",
});

console.log(`🚀 Client running at ${server.url}`);
