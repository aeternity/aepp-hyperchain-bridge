import { AeSdk, decode, MemoryAccount } from "@aeternity/aepp-sdk";
import { ExitRequest, tokenTypeToStr } from "@/types/bridge";
import nacl from "tweetnacl";

export const createSignature = async (
  sdk: AeSdk,
  request: ExitRequest,
  timestamp: number,
  ownerAddress: string
) => {
  const accountEntry = Object.entries(sdk.accounts).find(
    ([address]) => address === ownerAddress
  );
  const ownerAccount = accountEntry ? (accountEntry[1] as MemoryAccount) : null;
  if (!ownerAccount) {
    throw new Error("Owner account not found");
  }
  const message = createMessage(request, timestamp);
  const ownerSk = ownerAccount?.secretKey;
  const secret = nacl.sign.keyPair.fromSeed(decode(ownerSk!)).secretKey;
  const signedMessage = nacl.sign.detached(Buffer.from(message), secret);

  return Buffer.from(signedMessage).toString("hex");
};

export const createMessage = (request: ExitRequest, timestamp: number) => {
  const exitLinkStr = request.entry.exit_link
    ? [
        request.entry.exit_link.local_token,
        request.entry.exit_link.source_token || "",
        request.entry.exit_link.source_network_id,
        request.entry.exit_link.is_source_native.toString(),
      ].join(";")
    : [""];

  return [
    request.entry.idx.toString(),
    request.entry.from,
    request.entry.token || "",
    request.entry.amount.toString(),
    exitLinkStr,
    tokenTypeToStr(request.entry.token_type),
    request.entry.target_network_id,
    request.entry.source_network_id,
    request.entry_tx_hash,
    request.entry_token_meta.name,
    request.entry_token_meta.symbol,
    request.entry_token_meta.decimals.toString(),
    timestamp.toString(),
  ]
    .join(";")
    .toLowerCase();
};
