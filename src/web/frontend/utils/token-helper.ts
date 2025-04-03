import { getContract } from "@/utils/contract/helper";
import { walletSdk } from "./wallet-sdk";
import FungibleToken_aci from "@/aci/FungibleToken.json";
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
    FungibleToken_aci
  );
  const allowanceResult = (
    await contract.allowance({
      from_account: userAddress,
      for_account: bridgeAccountAddress,
    })
  ).decodedResult;

  if (allowanceResult === undefined) {
    await contract.create_allowance(bridgeAccountAddress, amount, { ttl: 30 });
  } else if (new BigNumber(allowanceResult.toString()).isLessThan(amount)) {
    await contract.change_allowance(bridgeAccountAddress, amount, { ttl: 30 });
  } else {
    return true;
  }
}

export async function getTokenContract(tokenAddress: string) {
  return getContract(
    walletSdk,
    tokenAddress as `ct_${string}`,
    FungibleToken_aci
  );
}
