import BigNumber from "bignumber.js";

BigNumber.config({ EXPONENTIAL_AT: 1e9 });

export const shorten = (
  address: string,
  start: number = 7,
  end: number = 3
) => {
  return `${address.slice(0, start)}...${address.slice(-end)}`;
};

export const formatBalance = ({
  balance,
  decimals = 0,
  formatDecimals = 0,
}: {
  balance: string | number | BigNumber | undefined;
  decimals?: number;
  formatDecimals?: number;
}) => {
  if (!balance) return "";
  return new BigNumber(balance).shiftedBy(-decimals).toFormat(formatDecimals);
};

export const normalizeUrls = <T>(obj: T) =>
  Object.entries(obj as { [key: string]: string }).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: value.endsWith("/") ? value.slice(0, -1) : value,
    }),
    {} as T
  );
