import moment from "moment";
import { BridgeEntryTx } from "@/types/bridge";
import { formatBalance, shorten } from "@/utils/data/formatters";
import {
  ArrowRightEndOnRectangleIcon,
  ArrowRightStartOnRectangleIcon,
  BanknotesIcon,
  CircleStackIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import { TokenAmount } from "@/types/token";
import useNetworks from "../../hooks/useNetworks";
import useBridgeContract from "../../hooks/useBridgeContract";

export interface BridgeActionDetailsModalProps {
  entryTx: BridgeEntryTx;
  token: TokenAmount;
  onClose: () => void;
}

export default function BridgeActionDetailsModal({
  token,
  entryTx,
  onClose,
}: BridgeActionDetailsModalProps) {
  const { exitBridge } = useBridgeContract();
  const { getNetworkById, currentNetwork } = useNetworks();
  const sourceNetwork = getNetworkById(entryTx.source_network_id)!;

  const connectedToTargetNetwork =
    currentNetwork?.id === entryTx.target_network.id;

  const handleBridgeComplete = async () => {
    await exitBridge(entryTx);
  };

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
        <h3 className="font-semibold text-2xl">Transaction Details</h3>
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
              <th>Entry Transaction:</th>
              <td className="flex-row flex items-center">
                <a
                  className="link "
                  href={`${sourceNetwork.explorerUrl}/transactions/${entryTx.hash}`}
                  target="_blank"
                >
                  {shorten(entryTx.hash, 16, 4)}
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
                  balance: entryTx.amount,
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
              <td>{`${entryTx.target_network.name} (${entryTx.target_network.id})`}</td>
            </tr>
          </tbody>
        </table>
        <div className="divider" />
        {!connectedToTargetNetwork ? (
          <div className="alert alert-warning">
            <ExclamationCircleIcon className="w-6 h-6 mr-0.5" />
            <p>
              Switch to{" "}
              <span className="font-medium">
                {entryTx.target_network.name} Network
              </span>{" "}
              on your wallet to continue the bridging process.
            </p>
          </div>
        ) : (
          <button
            className="btn bg-aepink text-white font-medium w-[200px] mb-2 mt-2 flex justify-self-center"
            color="primary"
            onClick={handleBridgeComplete}
          >
            Complete Bridge
          </button>
        )}
      </div>
    </dialog>
  );
}
