import deployments from "../../tests/deployments.json";

export function getLastDeployedBridgeContract(networkId: string): ContractDeployment | undefined {
  return deployments
    .filter((d: any) => d.networkId === networkId && d.name === "HyperchainBridge")
    .sort((a: any, b: any) => b.timestamp - a.timestamp)
    .map((d: any) => ({ ...d, address: d.address as `ct_${string}` }))[0];
}
