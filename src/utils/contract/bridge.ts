import { getBridgeContractForNetwork } from "./helper";

export const verifyBridgeActionCompletion = async (
  tx_hash: string,
  target_network_id: string,
  source_network_id: string
) => {
  const bridgeContract = await getBridgeContractForNetwork(target_network_id);

  const { decodedResult: result } =
    await bridgeContract.is_entry_transaction_processed(
      tx_hash,
      source_network_id
    );

  return result as boolean;
};
