import { useState, useEffect } from "react";
import { getTokenMetaInfo, Token } from "@aepp-hyperchain-bridge/shared";
import useBridgeContract from "./useBridgeContract";
import { getTokenContract } from "../utils/contract";

const useRegisteredTokens = () => {
  const { bridgeContract } = useBridgeContract();
  const [tokens, setTokens] = useState<Token[]>([]);

  useEffect(() => {
    if (bridgeContract) {
      bridgeContract
        .registered_tokens()
        .then((result) => result.decodedResult)
        .then(getTokensMeta)
        .then(setTokens);
    } else {
      setTokens([]);
    }
  }, [bridgeContract]);

  return tokens;
};

const getTokensMeta = async (addresses: string[]) =>
  Promise.all(
    addresses.map(async (address) =>
      getTokenContract(address).then(getTokenMetaInfo)
    )
  );
export default useRegisteredTokens;
