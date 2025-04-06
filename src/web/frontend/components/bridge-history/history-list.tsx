import { BridgeEntryTx } from "@/types/bridge";
import TransactionListItem from "./history-list-item";

interface Props {
  transactions: BridgeEntryTx[];
}

export default function BridgeHistoryList({ transactions }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="text-center text-2xl text-neutral mt-3">
        No transactions yet
      </div>
    );
  }

  return transactions.map((tx) => (
    <TransactionListItem key={tx.hash} tx={tx} />
  ));
}
