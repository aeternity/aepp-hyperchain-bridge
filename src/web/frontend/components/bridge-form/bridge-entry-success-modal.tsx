import { BridgeEntry } from "@/types/bridge";
import { byAddress, getNetworkById } from "@/utils/data/filters";
import { formatBalance, shorten } from "@/utils/data/formatters";
import {
  ArrowRightEndOnRectangleIcon,
  ArrowRightStartOnRectangleIcon,
  BanknotesIcon,
  CheckCircleIcon,
  CircleStackIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  LightBulbIcon,
  LinkIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";
import moment from "moment";
import { useTokenBalances } from "../../hooks/useTokenBalances";
import { TokenAmount } from "@/types/token";

export interface BridgeEntrySuccessModalProps {
  txResult: any;
  token: TokenAmount;
  onClose: () => void;
}

export default function BridgeEntrySuccessModal({
  token,
  txResult,
  onClose,
}: BridgeEntrySuccessModalProps) {
  const { hash, decodedResult } = txResult;
  const entry = decodedResult as BridgeEntry;
  const sourceNetwork = getNetworkById(entry.source_network_id)!;

  return (
    <dialog
      open
      className="modal modal-bottom sm:modal-middle"
      onClose={onClose}
    >
      <div className="modal-box sm:inline-table">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <h3 className="font-semibold text-lg">Transaction Details</h3>
        <p className="mt-2 font-medium flex  text-sm">
          <CheckCircleIcon className="w-5 h-5 mr-0.5 text-green-500" />
          Completed the first step of the bridge process.
        </p>
        <div className="divider" />
        <table className="table table-zebra">
          <tbody className="[&>tr>th]:font-semibold [&>tr>td]:font-medium [&>tr>td]:pr-0 [&>tr>th]:pl-0">
            <tr>
              <td>
                <ClockIcon className="w-5 h-5" />
              </td>
              <th>Date & Time:</th>
              <td>{moment().format("HH:mm | DD.MM.YYYY")}</td>
            </tr>
            <tr>
              <td>
                <DocumentTextIcon className="w-5 h-5" />
              </td>
              <th>Transaction hash:</th>
              <td className="flex-row flex items-center">
                <a
                  className="link "
                  href={`${sourceNetwork.explorerUrl}/transactions/${hash}`}
                  target="_blank"
                >
                  {shorten(hash, 16, 4)}
                </a>
                <LinkIcon className="ml-0.5" width={12} height={12} />
              </td>
            </tr>
            <tr>
              <td>
                <BanknotesIcon className="w-5 h-5" />
              </td>
              <th>Token</th>
              <td>{token?.name}</td>
            </tr>
            <tr>
              <td>
                <CircleStackIcon className="w-5 h-5" />
              </td>
              <th>Amount</th>
              <td>
                {formatBalance({
                  balance: entry.amount,
                  decimals: token?.decimals,
                  formatDecimals: 2,
                })}{" "}
                {token?.symbol}
              </td>
            </tr>
            <tr>
              <td>
                <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
              </td>
              <th>Source Network</th>
              <td>{`${sourceNetwork.name} (${sourceNetwork.id})`}</td>
            </tr>
            <tr>
              <td>
                <ArrowRightEndOnRectangleIcon className="w-5 h-5" />
              </td>
              <th>Target Network</th>
              <td>{`${entry.target_network.name} (${entry.target_network.id})`}</td>
            </tr>
          </tbody>
        </table>
        <div className="divider" />
        <div className="alert alert-warning">
          <ExclamationCircleIcon className="w-6 h-6 mr-0.5" />
          Connect to the target network to continue the bridging process.
        </div>
      </div>
    </dialog>
  );
}
