import { Token } from "@aepp-hyperchain-bridge/shared";
import { useState, useEffect, useContext, useCallback } from "react";
import { WalletContext } from "../context/wallet-provider";
import BigNumber from "bignumber.js";
import { mapTokensWithBalances } from "../utils/mappers";
import useRegisteredTokens from "./useRegisteredTokens";
import { getTokenContract } from "../utils/contract";

const useTokensWithBalances = () => {
  const tokens = useRegisteredTokens();
  const { address } = useContext(WalletContext);
  const [tokensWithBalances, setTokensWithBalances] = useState<Token[]>([]);

  useEffect(() => {
    reload();
  }, [tokens, address]);

  const reload = useCallback(() => {
    fetchBalances(tokens, address)
      .then((tokenBalances) => mapTokensWithBalances(tokens, tokenBalances))
      .then(setTokensWithBalances);
  }, [tokens, address]);

  return { tokensWithBalances, reload };
};

const fetchBalances = async (tokens: Token[], userAddress: string) => {
  const balances = await Promise.all(
    tokens.map((token) =>
      getTokenContract(token.address)
        .then((contract) => contract.balance(userAddress))
        .then((result) =>
          result.decodedResult ? result.decodedResult.toString() : "0"
        )
        .then(BigNumber)
    )
  );

  return tokens.map((token, index) => ({
    address: token.address,
    balance: balances[index],
  }));
};

export default useTokensWithBalances;
