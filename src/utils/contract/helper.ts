import { AeSdk, Contract } from "@aeternity/aepp-sdk";
import { Aci } from "@aeternity/aepp-sdk/es/contract/compiler/Base";
import { ContractMethodsBase } from "@aeternity/aepp-sdk/es/contract/Contract";

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
