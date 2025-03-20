import { Deposit } from "@/utils/types";
import TransactionListItem from "./transaction-list-item";

interface Props {
  deposits: Deposit[];
  isFetching: boolean;
}

export default function TransactionList({ deposits, isFetching }: Props) {
  if (isFetching) {
    return (
      <div className="flex justify-center">
        <span className="loading loading-spinner text-neutral"></span>
      </div>
    );
  }

  if (deposits.length === 0) {
    return (
      <div className="text-center text-2xl text-neutral">
        No transactions yet
      </div>
    );
  }

  return deposits.map((deposit) => (
    <TransactionListItem key={deposit.txHash} deposit={deposit} />
  ));
}
