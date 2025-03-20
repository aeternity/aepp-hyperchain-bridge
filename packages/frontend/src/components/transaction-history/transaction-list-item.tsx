import { shorten } from "@/utils/formatters";
import { Deposit } from "@/utils/types";
import { getNetworkById } from "@aepp-hyperchain-bridge/shared";
import moment from "moment";

interface Props {
  deposit: Deposit;
}

export default function TransactionListItem({ deposit }: Props) {
  const network = getNetworkById(deposit.fromNetworkId);
  return (
    <div className="flex-col text-sm p-2 rounded-sm border border-gray-200 mb-2 hover:bg-gray-100">
      <div className="flex-row">
        <div>
          <span className="font-semibold mr-1">Transaction:</span>
          <a
            target="_blank"
            className="link text-xs"
            href={`${network.explorerUrl}/transactions/${deposit.txHash}`}
          >
            {shorten(deposit.txHash)}
          </a>
        </div>
        <span>{moment(deposit.timestamp).format("D/M/YYYY, h:m")}</span>
      </div>
    </div>
  );
}
