import { formatBalance, shorten } from "@/utils/formatters";
import { Deposit } from "@/utils/types";
import { ArrowDownCircleIcon, LinkIcon } from "@heroicons/react/24/outline";

import moment from "moment";

interface Props {
  deposit: Deposit;
}

export default function TransactionListItem({ deposit }: Props) {
  return (
    <div className="flex-col text-sm mx-2 p-3 border-b border-gray-300 odd:bg-aepink-50">
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row items-center">
          <span className="font-medium mr-1">Deposit tx:</span>
          <a
            target="_blank"
            className="link text-xs flex-row flex items-center"
            href={`${deposit.fromNetwork.explorerUrl}/transactions/${deposit.txHash}`}
          >
            {shorten(deposit.txHash)}
            <LinkIcon className="ml-0.5" width={12} height={12} />
          </a>
        </div>
        <span className="text-xs">
          {moment(deposit.timestamp).format("D/M/YYYY, h:mm")}
        </span>
      </div>
      <div className="flex flex-row mt-2 justify-between">
        <div className="font-medium flex-col">
          <span>{deposit.fromNetwork.name}</span>
          <ArrowDownCircleIcon className="m-1" width={20} height={20} />
          <span>{deposit.toNetwork.name}</span>
        </div>
        <div className="flex-col flex justify-between items-end">
          <div>
            <span className="font-semibold mr-1 text-lg">
              {formatBalance({
                balance: deposit.amount,
                decimals: deposit.token.decimals,
                formatDecimals: null,
              })}
            </span>
            <span className="text-lg">{deposit.token.symbol}</span>
          </div>
          <div>
            <button className="btn btn-outline h-6 text-aepink hover:bg-aepink hover:border-white hover:text-white font-semibold tracking-wider">
              Claim
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
