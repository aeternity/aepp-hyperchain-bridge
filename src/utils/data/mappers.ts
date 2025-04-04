import { Network, NetworkBase } from "@/types/network";

export const mapBigIntsToNumbers = <T>(obj: any): T => {
  const result: any = {};

  for (const key in obj) {
    if (typeof obj[key] === "bigint") {
      result[key] = Number(obj[key]);
    } else if (obj[key] instanceof Array && obj[key].length == 0) {
      result[key] = obj[key];
    } else if (typeof obj[key] === "object") {
      result[key] = mapBigIntsToNumbers(obj[key]);
    } else {
      result[key] = obj[key];
    }
  }
  return result;
};

export const mapNetworkToBase = (network: Network): NetworkBase => ({
  id: network.id,
  name: network.name,
  url: network.url,
});
