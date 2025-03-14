import BigNumber from "bignumber.js";

BigNumber.config({ EXPONENTIAL_AT: 1e9 });

export const shorten = (address: string, start: number = 7, end: number = 3) => {
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

function numberWithCommas(x: number | string) {
  return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}
