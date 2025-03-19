import {
  BRIDGE_CONTRACTS,
  type BridgeContract,
} from "@aepp-hyperchain-bridge/shared";
import { getContractRow, insertDeposits } from "../db/helper";
import getBridgeContract from "../utils/get-contract-instance";

export default async function syncEvents() {
  for (const { address, networkId } of BRIDGE_CONTRACTS) {
    console.log(
      `Syncing events for contract ${address} on network ${networkId}`
    );
    const bridgeContract = await getBridgeContract(networkId, address);

    const contractRow = getContractRow(address, networkId);

    const contractDepositCount = parseInt(
      (await bridgeContract.deposits_count()).decodedResult
    );

    let startSyncFromIndex, endSyncAtIndex;

    if (contractRow.last_synced_deposit_id === null) {
      startSyncFromIndex = 0;
      endSyncAtIndex = contractDepositCount - 1;
    } else if (contractRow.last_synced_deposit_id < contractDepositCount - 1) {
      startSyncFromIndex = contractRow.last_synced_deposit_id + 1;
      endSyncAtIndex = contractDepositCount - 1;
    } else {
      continue;
    }

    const deposits = await getContractDeposits(
      bridgeContract,
      startSyncFromIndex,
      endSyncAtIndex
    );

    insertDeposits(networkId, address, deposits);
  }
}

async function getContractDeposits(
  contract: BridgeContract,
  from: number,
  to: number
) {
  if (to < from) return [];

  return (await contract.get_deposits_between(from, to)).decodedResult;
}
