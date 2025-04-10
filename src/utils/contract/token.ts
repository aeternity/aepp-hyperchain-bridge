import { AeSdk, Contract } from "@aeternity/aepp-sdk";
import { BridgeTestSetup, TokenLink } from "@/types/bridge";
import { Network } from "@/types/network";
import FungibleToken_aci from "@/aci/FungibleToken.json";
import { walletSdk } from "@/web/frontend/utils/wallet-sdk";
import { TokenMeta } from "@/types/token";

export const setAllowanceIfNeeded = async (
  token_link: TokenLink,
  from_account: string,
  for_account: string,
  bridge: BridgeTestSetup
) => {
  const contract = await Contract.initialize({
    ...bridge.sdk.getContext(),
    address: token_link.local_token as `ct_${string}`,
    aci: FungibleToken_aci,
  });

  const { decodedResult: allowance } = await contract.allowance({
    from_account,
    for_account,
  });

  if (!allowance) {
    const { hash, result } = await contract.create_allowance(for_account, 1e27);
    const { gasPrice, gasUsed } = result!;
    const txFee = await getTxFee(bridge.network, hash);

    return gasUsed * parseInt(gasPrice.toString()) + txFee;
  }
};

export const getOriginalTokenBalance = async (
  tokenLink: TokenLink,
  aeSdk: AeSdk,
  account: string
) => {
  if (!tokenLink) return 0;
  if (tokenLink.is_source_native) {
    return BigInt(await aeSdk.getBalance(account as `ak_${string}`));
  }

  return getTokenBalanceOfAccount(tokenLink.local_token, aeSdk, account);
};

export const getBridgedTokenBalance = (
  tokenLink: TokenLink,
  aeSdk: AeSdk,
  account: string
) => {
  if (!tokenLink) return 0;
  return getTokenBalanceOfAccount(tokenLink.local_token, aeSdk, account);
};

export const getTokenBalanceOfAccount = async (
  contractAddress: string | undefined,
  aeSdk: AeSdk,
  account: string
) => {
  if (contractAddress === undefined) return BigInt(0);
  if (contractAddress === "native") {
    return BigInt(await aeSdk.getBalance(account as `ak_${string}`));
  }

  const contract = await Contract.initialize({
    ...aeSdk.getContext(),
    address: contractAddress as `ct_${string}`,
    aci: FungibleToken_aci,
  });

  const { decodedResult: balance } = await contract.balance(account);
  return balance;
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

export const getTokenMeta = async (
  sdk: AeSdk,
  address: string
): Promise<TokenMeta> => {
  const contract = await Contract.initialize({
    ...sdk.getContext(),
    address: address as `ct_${string}`,
    aci: FungibleToken_aci,
  });

  return (await contract.meta_info()).decodedResult as TokenMeta;
};
