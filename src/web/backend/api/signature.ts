import assert from "assert";
import { createSdkInstance } from "@/utils/aeternity/create-sdk-node";
import { getBridgeContract } from "@/utils/contract/helper";
import { BridgeEntry, ExitRequest } from "@/types/bridge";
import { getTokenMeta } from "@/utils/contract/token";
import { createSignature } from "@/utils/signature/create-signature";
import { mapBigIntsToNumbers } from "@/utils/data/mappers";

export default {
  async GET(
    req: Bun.BunRequest<"/api/signature/:networkURL/:bridgeAddress/:entryIdx/:entryTxHash">
  ): Promise<Response> {
    try {
      const { entryIdx, bridgeAddress, networkURL, entryTxHash } = req.params;

      const [status, currency] = await Promise.all([
        fetch(`${networkURL}/v3/status`).then((res) => res.json()),
        fetch(`${networkURL}/v3/currency`).then((res) => res.json()),
      ]);

      const sdk = await createSdkInstance({
        id: status.network_id,
        url: networkURL,
        name: currency.network_name,
      });

      const operator = sdk.addresses()[0];

      const bridge = await getBridgeContract(
        sdk,
        bridgeAddress as `ct_${string}`
      );

      const _operator = (await bridge.operator()).decodedResult;

      if (operator !== _operator) {
        throw new Error(
          "Specified bridge contract is not deployed by the trusted operator"
        );
      }

      const _entry = await (
        await bridge.$getCallResultByTxHash(
          entryTxHash as `th_${string}`,
          "enter_bridge"
        )
      ).decodedResult;

      if (!_entry) {
        throw new Error(
          "No bridge entry found with the given transaction hash."
        );
      }

      const entry = (await bridge.bridge_entry(Number(entryIdx)))
        .decodedResult as BridgeEntry;

      if (!entry) {
        throw new Error("No entry found with the given entry idx.");
      }

      assert.deepEqual(
        entry,
        _entry,
        "Specified idx does not match the transaction hash."
      );

      const entry_token_meta = entry.token
        ? await getTokenMeta(sdk, entry.token)
        : {
            name: `${currency.network_name} ${currency.symbol} Token`,
            symbol: currency.symbol,
            decimals: BigInt(Math.log10(currency.subunits_per_unit)),
          };

      const _exitRequest: ExitRequest = {
        entry,
        entry_tx_hash: entryTxHash,
        entry_network: {
          name: currency.network_name,
          url: networkURL,
          id: status.network_id,
        },
        entry_token_meta,
      };
      const exitRequest = mapBigIntsToNumbers(_exitRequest) as ExitRequest;
      const timestamp = Date.now();
      const signature = await createSignature(
        sdk,
        exitRequest,
        timestamp,
        operator
      );

      return Response.json({ ok: true, signature, timestamp, exitRequest });
    } catch (error) {
      return Response.json({
        ok: false,
        error: (error as Error).message,
      });
    }
  },
};
