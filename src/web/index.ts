import { serve } from "bun";

import index from "./frontend/index.html";

import signature from "./backend/api/signature";
import { syncAll } from "./backend/lib/sync";
import * as actions from "./backend/api/actions";
import networks, { verifyNetwork } from "./backend/api/networks";

await syncAll();

const server = serve({
  port: 3000,
  routes: {
    "/*": index,
    "/api/networks": networks,
    "/api/networks/verify": verifyNetwork,
    "/api/actions/:userAddress": actions.getByUserAddress,
    "/api/actions/sync/:networkId/:hash": actions.syncTransaction,
    "/api/action/:sourceNetworkId/:entryIdx": actions.getByNetworkIdAndEntryIdx,
    "/api/signature/:networkURL/:bridgeAddress/:entryIdx/:entryTxHash":
      signature,
  },

  development: process.env.NODE_ENV !== "production",
});

console.log(`🚀 Client running at ${server.url}`);
