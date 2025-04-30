import {
  TypeResolver,
  ContractByteArrayEncoder,
} from "@aeternity/aepp-calldata";
import { AeSdk, Encoded } from "@aeternity/aepp-sdk";
import { Domain, ExitRequest } from "@/types/bridge";

import ExitRequest_aci from "@/aci/ExitRequest.json";

export const createSignature = async (
  sdk: AeSdk,
  domain: Domain,
  request: ExitRequest
): Promise<Encoded.Signature> => {
  const dataType = new TypeResolver().resolveType(ExitRequest_aci);
  const dataEncoded = new ContractByteArrayEncoder().encodeWithType(
    request,
    dataType
  );

  return await sdk.signTypedData(dataEncoded, ExitRequest_aci as any, {
    ...domain,
    onAccount: sdk.addresses()[0],
  });
};
