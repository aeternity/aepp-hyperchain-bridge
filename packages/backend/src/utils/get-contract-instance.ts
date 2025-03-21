import { HyperchainBridge_aci } from "@aepp-hyperchain-bridge/contracts";
import {
  createSdkInstance,
  getContract,
  getNetworkById,
} from "@aepp-hyperchain-bridge/shared";

export default async function getBridgeContract(
  networkId: string,
  contractAddress: string
) {
  const network = getNetworkById(networkId);
  const aeSdk = await createSdkInstance(network, false);
  return await getContract(
    aeSdk,
    contractAddress as `ct_${string}`,
    HyperchainBridge_aci
  );
}
