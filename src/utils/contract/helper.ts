import { AeSdk, Contract } from "@aeternity/aepp-sdk";
import { Aci } from "@aeternity/aepp-sdk/es/contract/compiler/Base";
import { ContractMethodsBase } from "@aeternity/aepp-sdk/es/contract/Contract";
import { HyperchainBridge, HyperchainBridgeContract } from "@/types/bridge";

import HyperchainBridge_aci from "@/aci/HyperchainBridge.json";
import FungibleToken_aci from "@/aci/FungibleToken.json";
import { FungibleToken, FungibleTokenContract } from "@/types/token";

export async function getContract<T extends ContractMethodsBase>(
  aeSdk: AeSdk,
  address: `ct_${string}`,
  aci: Aci
) {
  return await Contract.initialize<T>({
    ...aeSdk.getContext(),
    address,
    aci,
    omitUnknown: true,
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
    omitUnknown: true,
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
    omitUnknown: true,
  });
}
