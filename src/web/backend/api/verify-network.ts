import { TokenMeta } from "@/types/token";
import WebSocket from "ws";

interface ReqBody {
  node: string;
  mdw: string;
  mdwWS: string;
  explorer: string;
}

export default {
  async POST(req: Bun.BunRequest): Promise<Response> {
    const urls: ReqBody = await req.json();

    try {
      const { status, currency, mdwStatus, explorerPage, isMdwWsOk } =
        await readURLsData(urls);

      const networkId = status.network_id;
      const networkName = currency.network_name;
      const currency_: TokenMeta = {
        name: networkName,
        symbol: currency.symbol,
        decimals: Math.log10(currency.subunits_per_unit),
      };

      const ok =
        !!networkId &&
        !!networkName &&
        !!mdwStatus &&
        !!explorerPage &&
        isMdwWsOk;

      return Response.json({ ok, networkId, networkName, currency: currency_ });
    } catch (error) {
      console.error("Error verifying network:", error);
      return Response.json({
        ok: false,
        error: `Network verification failed: ${error}`,
      });
    }
  },
};

async function readURLsData(urls: ReqBody) {
  const { node, mdw, mdwWS, explorer } = urls;

  const [statusResp, currencyResp, mdwResp, explorerResp, isMdwWsOk] =
    await Promise.all([
      fetch(`${node}/v3/status`),
      fetch(`${node}/v3/currency`),
      fetch(`${mdw}/v3/status`),
      fetch(explorer),
      checkMdwWS(mdwWS),
    ]);
  if (!statusResp.ok) {
    throw new Error(`Node status request failed`);
  }

  if (!currencyResp.ok) {
    throw new Error(`Currency request failed`);
  }

  if (!mdwResp.ok) {
    throw new Error(`Middleware status request failed`);
  }

  if (!isMdwWsOk) {
    throw new Error(`Middleware WebSocket connection failed`);
  }

  if (!explorerResp.ok) {
    throw new Error(`Explorer request failed`);
  }

  const status = await statusResp.json();
  const currency = await currencyResp.json();
  const mdwStatus = await mdwResp.json();
  const explorerPage = await explorerResp.text();

  return {
    status,
    currency,
    mdwStatus,
    explorerPage,
    isMdwWsOk,
  };
}

const checkMdwWS = async (url: string) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(false), 2000);
    const ws = new WebSocket(url);
    ws.on("open", () => {
      ws.send(JSON.stringify({ op: "Ping" }));
    });
    ws.on("message", (data) => {
      const { payload } = JSON.parse(data.toString());
      ws.close();
      resolve(payload === "Pong");
    });
  });
};
