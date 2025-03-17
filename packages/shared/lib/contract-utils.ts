import { Contract, AeSdk } from "@aeternity/aepp-sdk";
import { type Aci } from "@aeternity/aepp-sdk/es/contract/compiler/Base";

export async function getContract(
  aeSdk: AeSdk,
  address: `ct_${string}`,
  aci: Aci
) {
  return await Contract.initialize({
    ...aeSdk.getContext(),
    address,
    aci,
  });
}
