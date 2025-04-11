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
