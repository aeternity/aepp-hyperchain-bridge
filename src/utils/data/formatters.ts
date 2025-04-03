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
  balance: string | number | BigNumber | bigint | undefined;
  decimals?: number | bigint;
  formatDecimals?: number;
}) => {
  if (!balance) return "";
  return new BigNumber(balance.toString())
    .shiftedBy(-Number(decimals))
    .toFormat(formatDecimals);
};
