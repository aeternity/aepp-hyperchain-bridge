import { getContract } from "@aepp-hyperchain-bridge/shared";
import { walletSdk } from "./wallet-sdk";
import { BridgeToken_aci } from "@aepp-hyperchain-bridge/contracts";
import BigNumber from "bignumber.js";

export async function setTokenAllowance(
  amount: string,
  tokenAddress: string,
  userAddress: string,
  bridgeAddress: string
) {
  const bridgeAccountAddress = bridgeAddress.replace("ct_", "ak_");
  const contract = await getContract(
    walletSdk,
    tokenAddress as `ct_${string}`,
    BridgeToken_aci
  );
  const allowanceResult = (
    await contract.allowance({
      from_account: userAddress,
      for_account: bridgeAccountAddress,
    })
  ).decodedResult;

  if (allowanceResult === undefined) {
    await contract.create_allowance(bridgeAccountAddress, amount);
  } else if (new BigNumber(allowanceResult.toString()).isLessThan(amount)) {
    await contract.change_allowance(bridgeAccountAddress, amount);
  } else {
    return true;
  }
}

export async function getTokenContract(tokenAddress: string) {
  return getContract(
    walletSdk,
    tokenAddress as `ct_${string}`,
    BridgeToken_aci
  );
}
