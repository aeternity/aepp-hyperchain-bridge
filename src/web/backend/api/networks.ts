import { Network } from "@/types/network";
import { supabase } from "../lib/supabase";
import { createSdkInstance } from "@/utils/aeternity/create-sdk-node";
import { deployBridgeContract } from "@/utils/script/scripts-helper";
import { queryNetworks } from "../lib/queries";
import { TokenMeta } from "@/types/token";
import {
  NetworkUrls,
  readURLsData,
  throwWhenNetworkExists,
} from "../lib/verify";

export default {
  async GET(req: Bun.BunRequest<"/api/networks">): Promise<Response> {
    try {
      const networks = await queryNetworks();
      return Response.json({ ok: true, data: networks || [] });
    } catch (error: any) {
      return Response.json({ ok: false, error: error.message });
    }
  },
  async POST(req: Bun.BunRequest<"/api/networks">): Promise<Response> {
    const body: Network = await req.json();

    try {
      await throwWhenNetworkExists(body);

      const sdk = createSdkInstance(body);
      const bridgeContract = await deployBridgeContract(sdk);
      await bridgeContract.init();

      const network: Network = {
        id: body.id,
        url: body.url,
        name: body.name,
        mdwUrl: body.mdwUrl,
        explorerUrl: body.explorerUrl,
        mdwWebSocketUrl: body.mdwWebSocketUrl,
        bridgeContractAddress: bridgeContract.$options.address as string,
      };

      const { data, error } = await supabase
        .from("networks")
        .insert(network)
        .select();

      if (error) {
        throw new Error(error.message);
      }

      return Response.json({
        ok: true,
        data: data[0],
      });
    } catch (error: any) {
      return Response.json({ ok: false, error: error.message });
    }
  },
};

export const verifyNetwork = {
  async POST(req: Bun.BunRequest<"/api/networks/verify">): Promise<Response> {
    const urls: NetworkUrls = await req.json();

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
