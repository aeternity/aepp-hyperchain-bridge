import { getNetworkById } from "./filters";
import { aeSdk, getContract } from "./ae-sdk";
import { GenericContract } from "@/types/contract";

import Token_aci from "../../contracts/aci/BridgeToken.json";
import BigNumber from "bignumber.js";

export async function getRegisteredNetworksAndTokens(bridgeContract: GenericContract) {
  const [registeredNetworks, registeredTokens] = await Promise.all([
    getRegisteredNetworks(bridgeContract),
    getRegisteredTokens(bridgeContract),
  ]);

  return { registeredNetworks, registeredTokens };
}

export async function getTokenMetaInfo(address: string) {
  const contract = await getContract(aeSdk, address as `ct_${string}`, Token_aci);

  return contract.meta_info().then((result: any) => ({
    ...result.decodedResult,
    decimals: parseInt(result.decodedResult.decimals),
    address,
  }));
}

export async function getRegisteredTokens(bridgeContract: GenericContract): Promise<Token[]> {
  const tokenAddresses = await bridgeContract
    .registered_tokens()
    .then((result: any) => result.decodedResult as string[]);

  return Promise.all(tokenAddresses.map(getTokenMetaInfo));
}

export async function getRegisteredNetworks(bridgeContract: GenericContract): Promise<Network[]> {
  const networkIds = await bridgeContract
    .registered_networks()
    .then((result: any) => result.decodedResult as string[]);

  return networkIds.map(getNetworkById) as Network[];
}

export async function getTokenBalances(tokens: Token[], address: string): Promise<TokenBalance[]> {
  const tokenBalances = await Promise.all(tokens.map((token) => getTokenBalance(token, address)));

  return tokens.map((token, index) => ({
    address: token.address,
    balance: tokenBalances[index],
  }));
}

export async function getTokenBalance(token: Token, address: string) {
  const contract = await getContract(aeSdk, token.address as `ct_${string}`, Token_aci);
  const result = (await contract.balance(address)).decodedResult;
  const balance = result ? result.toString() : "0";

  return new BigNumber(balance).shiftedBy(-token.decimals);
}

export async function setTokenAllowance(
  amount: string,
  tokenAddress: string,
  userAddress: string,
  bridgeAddress: string,
) {
  const bridgeAccountAddress = bridgeAddress.replace("ct_", "ak_");
  const contract = await getContract(aeSdk, tokenAddress as `ct_${string}`, Token_aci);
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
