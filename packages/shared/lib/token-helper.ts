import { Token, TokenContract } from "./types";

export async function getTokenMetaInfo(
  tokenContract: TokenContract
): Promise<Token[]> {
  return tokenContract.meta_info().then((result: any) => ({
    ...result.decodedResult,
    decimals: parseInt(result.decodedResult.decimals),
    address: tokenContract.$options.address,
  }));
}
