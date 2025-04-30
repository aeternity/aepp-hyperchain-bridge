import { Domain } from "@/types/bridge";
import { Network } from "@/types/network";
import { TokenAmount } from "@/types/token";
import BigNumber from "bignumber.js";

export const fromAccountsBalancesToTokenAmount = (data: any): TokenAmount => ({
  name: data.token_name,
  symbol: data.token_symbol,
  address: data.contract_id,
  decimals: BigInt(data.decimals),
  amount: new BigNumber(data.amount),
});
