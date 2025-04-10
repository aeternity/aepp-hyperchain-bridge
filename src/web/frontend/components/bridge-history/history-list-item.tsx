import moment from "moment";
import { BridgeEntryTx } from "@/types/bridge";
import { byAddress, getNetworkById } from "@/utils/data/filters";
import { formatBalance, shorten } from "@/utils/data/formatters";
import { ArrowDownCircleIcon, LinkIcon } from "@heroicons/react/24/outline";
import { useTokenBalances } from "@/frontend/hooks/useTokenBalances";
import Claim from "./claim";

interface Props {
  tx: BridgeEntryTx;
}

export default function TransactionListItem({ tx }: Props) {
  const { tokens } = useTokenBalances();
  const targetNetwork = getNetworkById(tx.target_network.id)!;
  const sourceNetwork = getNetworkById(tx.source_network_id)!;
  const token = tokens.find(byAddress(tx.token || "native"));

  return (
    <div className="flex-col text-sm mx-2 p-3 border-b border-gray-300 odd:bg-aepink-50">
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row items-center">
          <span className="font-medium mr-1">Deposit tx:</span>
          <a
            target="_blank"
            className="link text-xs flex-row flex items-center"
            href={`${sourceNetwork.explorerUrl}/transactions/${tx.hash}`}
          >
            {shorten(tx.hash)}
            <LinkIcon className="ml-0.5" width={12} height={12} />
          </a>
        </div>
        <span className="text-xs">
          {moment(tx.timestamp).format("D/M/YYYY, h:mm")}
        </span>
      </div>
      <div className="flex flex-row mt-2 justify-between">
        <div className="font-medium flex-col">
          <span>{sourceNetwork.name}</span>
          <ArrowDownCircleIcon className="m-1" width={20} height={20} />
          <span>{targetNetwork.name}</span>
        </div>
        <div className="flex-col flex justify-between items-end">
          <div>
            <span className="font-semibold mr-1 text-lg">
              {token &&
                formatBalance({
                  balance: tx.amount,
                  decimals: token.decimals,
                  formatDecimals: 2,
                })}
            </span>
            <span className="text-lg">{token?.symbol}</span>
          </div>
          <div>
            {tx.is_action_completed ? "Completed!" : <Claim transaction={tx} />}
          </div>
        </div>
      </div>
    </div>
  );
}
