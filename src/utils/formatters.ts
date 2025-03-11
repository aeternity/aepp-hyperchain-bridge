export const shorten = (address: string, start: number = 7, end: number = 3) => {
  return `${address.slice(0, start)}...${address.slice(-end)}`;
};

export const formatBalance = (balance: string, decimals: number = 18) => {
  if (balance === "") return "0.00";
  return `${(parseInt(balance) / Math.pow(10, decimals)).toFixed(2)}`;
};
