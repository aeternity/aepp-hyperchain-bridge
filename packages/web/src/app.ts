import { serve } from "bun";
import index from "./public/index.html";
import syncEvents from "./backend/service/sync-events";
import initDb from "./backend/db/init";

initDb();

const server = serve({
  routes: {
    "/*": index,

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
