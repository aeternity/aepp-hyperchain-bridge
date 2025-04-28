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
        "link.local_token:",
        request.entry.exit_link.local_token,
        ";",
        "link.source_token:",
        request.entry.exit_link.source_token || "",
        ";",
        "link.source_network_id:",
        request.entry.exit_link.source_network_id,
        ";",
        "link.is_source_native:",
        request.entry.exit_link.is_source_native.toString(),
        ";",
      ].join("")
    : ["token_link:;"];

  return [
    "entry.idx:",
    request.entry.idx.toString(),
    ";",
    "entry.from:",
    request.entry.from,
    ";",
    "entry.token:",
    request.entry.token || "",
    ";",
    "entry.amount:",
    request.entry.amount.toString(),
    ";",
    exitLinkStr,
    "entry.token_type:",
    tokenTypeToStr(request.entry.token_type),
    ";",
    "entry.target_network_id:",
    request.entry.target_network_id,
    ";",
    "entry.source_network_id:",
    request.entry.source_network_id,
    ";",
    "entry_tx_hash:",
    request.entry_tx_hash,
    ";",
    "meta.name:",
    request.entry_token_meta.name,
    ";",
    "meta.symbol:",
    request.entry_token_meta.symbol,
    ";",
    "meta.decimals:",
    request.entry_token_meta.decimals.toString(),
    ";",
    "timestamp:",
    timestamp.toString(),
  ]
    .join("")
    .toLowerCase();
};
