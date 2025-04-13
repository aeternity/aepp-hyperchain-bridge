import { Network } from "@/types/network";
import { supabase } from "../lib/supabase";
import { DEFAULT_NETWORKS } from "@/constants/networks";
import { createSdkInstance } from "@/utils/aeternity/create-sdk-node";
import { deployBridgeContract } from "@/utils/script/scripts-helper";

export default {
  async GET(req: Bun.BunRequest): Promise<Response> {
    let { data } = await supabase.from("networks").select("*");
    return Response.json(data);
  },
  async POST(req: Bun.BunRequest): Promise<Response> {
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

async function throwWhenNetworkExists(network: Network) {
  const found = DEFAULT_NETWORKS.find(
    (n) =>
      n.id === network.id ||
      n.url === network.url ||
      n.mdwUrl === network.mdwUrl ||
      n.mdwWebSocketUrl === network.mdwWebSocketUrl
  );
  if (found) {
    throw new Error(`Network exists: ${found.name}`);
  }

  const { data, count } = await supabase
    .from("networks")
    .select("*")
    .or(
      `id.is.${network.id},url.is.${network.url},mdwUrl.is.${network.mdwUrl},mdwWebSocketUrl.is.${network.mdwWebSocketUrl}`
    );
  if (count) {
    throw new Error(`Network exists: ${data[0].name}`);
  }
}
