import { serve } from "bun";
import syncEvents from "./src/service/sync-events";
import initDb from "./src/db/init";

initDb();
setInterval(syncEvents, 10_000);

const server = serve({
  port: 3001,
  routes: {
    "/api/sync": {
      async GET() {
        const result = await syncEvents();
        return Response.json({
          message: result,
          method: "GET",
        });
      },
    },
  },

  development: process.env.NODE_ENV !== "production",
});

console.log(`🚀 Backend running at ${server.url}`);
