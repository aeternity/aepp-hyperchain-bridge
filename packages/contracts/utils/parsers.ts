import { Network } from "@aepp-hyperchain-bridge/shared";

export const convertAllBigIntsToInts = (obj: any) => {
  const result: any = {};

  for (const key in obj) {
    if (typeof obj[key] === "bigint") {
      result[key] = Number(obj[key]);
    } else if (obj[key] instanceof Array && obj[key].length == 0) {
      result[key] = obj[key];
    } else if (typeof obj[key] === "object") {
      result[key] = convertAllBigIntsToInts(obj[key]);
    } else {
      result[key] = obj[key];
    }
  }
  return result;
};

export const mapNetwork = (network: Network) => ({
  id: network.id,
  name: network.name,
  url: network.url,
});
