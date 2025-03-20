import {
  byAddress,
  getNetworkById,
  Token,
} from "@aepp-hyperchain-bridge/shared";
import { Deposit, TokenBalance, Transaction } from "./types";
import BigNumber from "bignumber.js";

export const mapTokensWithBalances = (
  registeredTokens: Token[],
  tokenBalances: TokenBalance[]
): Token[] => {
  return registeredTokens.map((token) => {
    const tokenBalance = tokenBalances.find(
      (balance) => balance.address === token.address
    );
    return { ...token, balance: tokenBalance?.balance };
  });
};

export const transactionToDeposit =
  (fromNetworkId: string, tokens: Token[]) =>
  (t: Transaction): Deposit => ({
    idx: t.tx.return.value,
    token: tokens.find(byAddress(t.tx.arguments[1].value)),
    toNetwork: getNetworkById(t.tx.arguments[0].value),
    amount: new BigNumber(t.tx.arguments[2].value),
    timestamp: t.micro_time,
    txHash: t.hash,
    fromNetwork: getNetworkById(fromNetworkId),
  });
