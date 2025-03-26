import { AeSdk, Contract } from "@aeternity/aepp-sdk";
import { Bridge, ChildToken } from "./types";
import { FungibleToken_aci, Network } from "@aepp-hyperchain-bridge/shared";
import { sleep } from "bun";

export const setAllowanceIfNeeded = async (
  child_token: ChildToken,
  from_account: string,
  for_account: string,
  bridge: Bridge
) => {
  const contract = await Contract.initialize({
    ...bridge.sdk.getContext(),
    address: child_token.ct as `ct_${string}`,
    aci: FungibleToken_aci,
  });

  const { decodedResult: allowance } = await contract.allowance({
    from_account,
    for_account,
  });

  if (!allowance) {
    const {
      hash,
      result: { gasPrice, gasUsed },
    } = await contract.create_allowance(for_account, 1e27);

    const txFee = await getTxFee(bridge.network, hash);

    return gasUsed * parseInt(gasPrice.toString()) + txFee;
  }
};

export const getOriginalTokenBalance = async (
  childToken: ChildToken,
  aeSdk: AeSdk,
  account: string
) => {
  if (!childToken) return 0;
  if (childToken.is_native) {
    return parseInt(await aeSdk.getBalance(account as `ak_${string}`));
  }

  return getTokenBalanceOfAccount(childToken.ct, aeSdk, account);
};

export const getBridgedTokenBalance = (
  childToken: ChildToken,
  aeSdk: AeSdk,
  account: string
) => {
  if (!childToken) return 0;
  return getTokenBalanceOfAccount(childToken.ct, aeSdk, account);
};

export const getTokenBalanceOfAccount = async (
  contractAddress: string,
  aeSdk: AeSdk,
  account: string
) => {
  if (contractAddress === null) return 0;
  if (contractAddress === "native") {
    return parseInt(await aeSdk.getBalance(account as `ak_${string}`));
  }

  const contract = await Contract.initialize({
    ...aeSdk.getContext(),
    address: contractAddress as `ct_${string}`,
    aci: FungibleToken_aci,
  });

  const { decodedResult: balance } = await contract.balance(account);
  return parseInt(balance);
};

export const getTxFee = async (network: Network, hash: string) => {
  const url = `${network.mdwUrl}/v3/transactions/${hash}`;
  const getTx = async () => {
    return fetch(url)
      .then((res) => res.json())
      .then((res) => res.tx);
  };
  while (true) {
    const tx = await getTx();
    if (tx) {
      return parseInt(tx.fee);
    }
  }
};
