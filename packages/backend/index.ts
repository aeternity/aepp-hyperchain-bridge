import { serve } from "bun";
import syncEvents from "./src/service/sync-events";
import initDb from "./src/db/init";

initDb();

const server = serve({
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

console.log(`🚀 Server running at ${server.url}`);
