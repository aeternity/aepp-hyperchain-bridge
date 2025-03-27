import { AeSdk, decode } from "@aeternity/aepp-sdk";
import { ExitRequest, tokenTypeToStr } from "./types";
import nacl from "tweetnacl";

export const createSignature = async (
  sdk: AeSdk,
  request: ExitRequest,
  timestamp: number,
  ownerAddress: string
) => {
  const message = createMessage(request, timestamp);
  const ownerSk = (sdk.accounts[ownerAddress] as any).secretKey;
  const secret = nacl.sign.keyPair.fromSeed(decode(ownerSk)).secretKey;
  const signedMessage = nacl.sign.detached(Buffer.from(message), secret);

  return Buffer.from(signedMessage).toString("hex");
};

export const createMessage = (request: ExitRequest, timestamp: number) => {
  const exitLinkStr = request.entry.exit_link
    ? [
        request.entry.exit_link.local_token,
        request.entry.exit_link.source_token || "",
        request.entry.exit_link.source_network.id,
        request.entry.exit_link.source_network.url,
        request.entry.exit_link.is_source_native.toString(),
      ].join("")
    : [""];

  return [
    request.entry.idx.toString(),
    request.entry.from,
    request.entry.token || "",
    request.entry.amount.toString(),
    exitLinkStr,
    tokenTypeToStr(request.entry.token_type),
    request.entry.target_network.id,
    request.entry.target_network.url,
    request.entry_tx_hash,
    request.entry_network.id,
    request.entry_network.url,
    request.entry_token_meta.name,
    request.entry_token_meta.symbol,
    request.entry_token_meta.decimals.toString(),
    timestamp.toString(),
  ]
    .join("")
    .toLowerCase();
};
