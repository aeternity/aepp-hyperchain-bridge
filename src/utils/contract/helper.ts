import { AeSdk, Contract } from "@aeternity/aepp-sdk";
import { Aci } from "@aeternity/aepp-sdk/es/contract/compiler/Base";
import { ContractMethodsBase } from "@aeternity/aepp-sdk/es/contract/Contract";
import { getNetworkById } from "../data/filters";
import { createSdkBrowser } from "../aeternity/create-sdk-browser";
import { HyperchainBridge, HyperchainBridgeContract } from "@/types/bridge";

import HyperchainBridge_aci from "@/aci/HyperchainBridge.json";

export async function getContract<T extends ContractMethodsBase>(
  aeSdk: AeSdk,
  address: `ct_${string}`,
  aci: Aci
) {
  return await Contract.initialize<T>({
    ...aeSdk.getContext(),
    address,
    aci,
  });
}

export async function getBridgeContractForNetwork(
  id: string
): Promise<HyperchainBridgeContract> {
  const network = getNetworkById(id);
  if (!network) {
    throw new Error("Network not found");
  }

  const sdk = await createSdkBrowser(network);
  return await getContract<HyperchainBridge>(
    sdk,
    network.bridgeContractAddress as `ct_${string}`,
    HyperchainBridge_aci
  );
}
