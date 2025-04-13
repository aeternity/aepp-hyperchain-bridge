import moment from "moment";
import { BridgeAction } from "@/types/bridge";
import { formatBalance, shorten } from "@/utils/data/formatters";
import {
  ArrowDownCircleIcon,
  CheckBadgeIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";

import useNetworks from "../../hooks/useNetworks";
import { useContext } from "react";
import { BridgeActionContext } from "../../context/bridge-action-provider";

interface Props {
  action: BridgeAction;
}

export default function TransactionListItem({ action }: Props) {
  const { getNetworkById } = useNetworks();
  const { setModalAction } = useContext(BridgeActionContext);

  const targetNetwork = getNetworkById(action.targetNetworkId)!;
  const sourceNetwork = getNetworkById(action.sourceNetworkId)!;

  return (
    <div
      className="flex-col text-sm mx-2 p-3 border-b border-gray-300 odd:bg-aepink-50 relative cursor-pointer hover:bg-aepink-100"
      onClick={() => setModalAction(action)}
    >
      {action.isCompleted && (
        <CheckBadgeIcon className="stroke-green-500 w-20 h-20 absolute -z-10 left-3/7 top-1/7 opacity-10" />
      )}
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row items-center">
          <span className="font-medium mr-1">Enter tx:</span>
          <a
            target="_blank"
            className="link text-xs flex-row flex items-center"
            href={`${sourceNetwork.explorerUrl}/transactions/${action.entryTxHash}`}
          >
            {shorten(action.entryTxHash)}
            <LinkIcon className="ml-0.5" width={12} height={12} />
          </a>
        </div>
        <span className="text-xs">
          {moment(action.entryTimestamp).format("D/M/YYYY, h:mm")}
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
              {formatBalance({
                balance: action.amount,
                decimals: action.tokenDecimals,
                formatDecimals: 2,
              })}
            </span>
            <span className="text-lg">{action.tokenSymbol}</span>
          </div>
          <div>
            {action.isCompleted ? (
              <div className="flex">
                <span className="font-medium mr-1">Exit tx:</span>
                <a
                  target="_blank"
                  className="link text-xs flex-row flex items-center"
                  href={`${targetNetwork.explorerUrl}/transactions/${action.exitTxHash}`}
                >
                  {shorten(action.exitTxHash!)}
                  <LinkIcon className="ml-0.5" width={12} height={12} />
                </a>
              </div>
            ) : (
              <button
                onClick={() => setModalAction(action)}
                className="btn btn-outline h-6 text-aepink hover:bg-aepink hover:border-white hover:text-white font-semibold tracking-wider"
              >
                Complete Bridge
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
