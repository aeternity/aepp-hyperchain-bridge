import { getActionsByUser, getActionByNetworkAndIdx } from "../lib/db";
import { syncAction } from "../lib/sync";

export const getByUserAddress = {
  async GET(
    req: Bun.BunRequest<"/api/actions/:userAddress">
  ): Promise<Response> {
    const { userAddress } = req.params;

    try {
      const data = await getActionsByUser(userAddress);
      return Response.json({ ok: true, data });
    } catch (error: any) {
      return Response.json({ ok: false, error: error.message });
    }
  },
};

export const getByNetworkIdAndEntryIdx = {
  async GET(
    req: Bun.BunRequest<"/api/action/:sourceNetworkId/:entryIdx">
  ): Promise<Response> {
    const { sourceNetworkId, entryIdx } = req.params;

    try {
      const data = await getActionByNetworkAndIdx(
        sourceNetworkId,
        Number(entryIdx)
      );
      return Response.json({ ok: true, data: data[0] });
    } catch (error: any) {
      return Response.json({ ok: false, error: error.message });
    }
  },
};

export const syncTransaction = {
  async GET(
    req: Bun.BunRequest<"/api/actions/sync/:networkId/:hash">
  ): Promise<Response> {
    const { networkId, hash } = req.params;

    const action = await syncAction(hash, networkId);

    if (!action) {
      return Response.json({ ok: false, error: "Action not found" });
    }

    return Response.json({ ok: true, data: action });
  },
};
