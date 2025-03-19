import { Token } from "@aepp-hyperchain-bridge/shared";
import { TokenBalance } from "./types";

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
