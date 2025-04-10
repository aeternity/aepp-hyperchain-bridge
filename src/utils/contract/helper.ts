import { AeSdk, Contract } from "@aeternity/aepp-sdk";
import { Aci } from "@aeternity/aepp-sdk/es/contract/compiler/Base";
import { ContractMethodsBase } from "@aeternity/aepp-sdk/es/contract/Contract";
import { getNetworkById } from "../data/filters";
import { createSdkBrowser } from "../aeternity/create-sdk-browser";
import { HyperchainBridge, HyperchainBridgeContract } from "@/types/bridge";

import HyperchainBridge_aci from "@/aci/HyperchainBridge.json";
import FungibleToken_aci from "@/aci/FungibleToken.json";
import { FungibleToken, FungibleTokenContract } from "@/types/token";
import { AciContractCallEncoder } from "@aeternity/aepp-calldata";

const BridgeCallData = new AciContractCallEncoder(HyperchainBridge_aci);

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

export async function getBridgeContract(
  aeSdk: AeSdk,
  address: `ct_${string}`
): Promise<HyperchainBridgeContract> {
  return await Contract.initialize<HyperchainBridge>({
    ...aeSdk.getContext(),
    aci: HyperchainBridge_aci,
    address,
  });
}

export async function getTokenContract(
  aeSdk: AeSdk,
  address: `ct_${string}`
): Promise<FungibleTokenContract> {
  return await Contract.initialize<FungibleToken>({
    ...aeSdk.getContext(),
    aci: FungibleToken_aci,
    address,
  });
}

const contractInstanceMap = new Map<string, HyperchainBridgeContract>();

export async function getBridgeContractForNetwork(
  id: string
): Promise<HyperchainBridgeContract> {
  const network = getNetworkById(id);
  if (!network) {
    throw new Error("Network not found");
  }

  const sdk = await createSdkBrowser(network);

  if (!contractInstanceMap.has(network.id)) {
    contractInstanceMap.set(
      network.id,
      await getContract<HyperchainBridge>(
        sdk,
        network.bridgeContractAddress as `ct_${string}`,
        HyperchainBridge_aci
      )
    );
  }

  return contractInstanceMap.get(network.id)!;
}
