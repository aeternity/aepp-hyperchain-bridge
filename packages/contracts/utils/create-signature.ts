import { AeSdk, decode } from "@aeternity/aepp-sdk";
import { Claim, Deposit, tokenTypeToStr } from "./types";
import nacl from "tweetnacl";

export const createSignature = async (
  sdk: AeSdk,
  claim: Claim,
  timestamp: number,
  ownerAddress: string
) => {
  const message = createMessage(claim, timestamp);
  const ownerSk = (sdk.accounts[ownerAddress] as any).secretKey;
  const secret = nacl.sign.keyPair.fromSeed(decode(ownerSk)).secretKey;
  const signedMessage = nacl.sign.detached(Buffer.from(message), secret);

  return Buffer.from(signedMessage).toString("hex");
};

export const createMessage = (claim: Claim, timestamp: number) => {
  const original_token = !claim.deposit.original_token
    ? [""]
    : [
        claim.deposit.original_token.ct,
        claim.deposit.original_token.is_native.toString(),
        claim.deposit.original_token.original_token || "",
        claim.deposit.original_token.origin_network.id,
        claim.deposit.original_token.origin_network.url,
      ].join("");
  return [
    claim.deposit.idx.toString(),
    claim.deposit_tx_hash,
    tokenTypeToStr(claim.deposit.token_type),
    claim.deposit.amount.toString(),
    claim.deposit_token_meta.id || "",
    claim.deposit_token_meta.decimals.toString(),
    claim.deposit.for_network.id,
    claim.deposit.for_network.url,
    claim.deposit_network.id,
    claim.deposit_network.url,
    claim.deposit.from,
    original_token,
    timestamp.toString(),
  ]
    .join("")
    .toLowerCase();
};
