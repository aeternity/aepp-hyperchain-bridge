import { BridgeEntryTx, TokenType } from "@/types/bridge";
import { TokenAmount } from "@/types/token";
import BigNumber from "bignumber.js";

export const fromAccountsBalancesToTokenAmount = (data: any): TokenAmount => ({
  name: data.token_name,
  symbol: data.token_symbol,
  address: data.contract_id,
  decimals: BigInt(data.decimals),
  amount: new BigNumber(data.amount),
});

export const fromTransactionToBridgeEntryTx = (data: any): BridgeEntryTx => {
  const returnValue = data.tx.return.value;
  const token =
    returnValue[2].value.length > 1 ? returnValue[2].value[1].value : undefined;

  return {
    tx_hash: data.hash,
    timestamp: data.micro_time,
    idx: BigInt(returnValue[0].value),
    from: returnValue[1].value,
    token,
    amount: BigInt(returnValue[3].value),
    token_type: tokenTypeFromIndex(returnValue[5].value[0]),
    target_network: {
      id: returnValue[6].value[0].value,
      url: returnValue[6].value[1].value,
      name: returnValue[6].value[2].value,
    },
    source_network_id: returnValue[7].value,
    exit_link: returnValue[4].value,
  };
};

const tokenTypeFromIndex = (index: number) => {
  switch (index) {
    case 0:
      return TokenType.Native;
    case 1:
      return TokenType.Link;
    case 2:
      return TokenType.Standard;
    default:
      throw new Error(`Unknown token type index: ${index}`);
  }
};
