import { BridgeAction } from "@/types/bridge";
import TransactionListItem from "./history-list-item";

interface Props {
  actions: BridgeAction[];
}

export default function BridgeHistoryList({ actions }: Props) {
  if (actions.length === 0) {
    return (
      <div className="text-center text-2xl text-neutral mt-3">
        No transactions yet
      </div>
    );
  }

  return actions.map((action) => (
    <TransactionListItem key={action.entryTxHash} action={action} />
  ));
}
