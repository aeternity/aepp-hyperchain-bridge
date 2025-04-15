import moment from "moment";

import { formatBalance, shorten } from "@/utils/data/formatters";
import {
  ArrowRightEndOnRectangleIcon,
  ArrowRightStartOnRectangleIcon,
  BanknotesIcon,
  CheckCircleIcon,
  CircleStackIcon,
  CalendarIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";

import { useContext } from "react";
import { BridgeActionContext } from "../../context/bridge-action-provider";
import { WalletContext } from "../../context/wallet-provider";

export default function BridgeActionDetailsModal() {
  const { getNetworkById, currentNetwork } = useContext(WalletContext);
  const { exitBridge, modalAction, setModalAction, isBusy } =
    useContext(BridgeActionContext);

  if (!modalAction) return null;

  const sourceNetwork = getNetworkById(modalAction.sourceNetworkId)!;
  const targetNetwork = getNetworkById(modalAction.targetNetworkId)!;
  const connectedToTargetNetwork = currentNetwork?.id === targetNetwork.id;

  const handleBridgeComplete = async () => {
    await exitBridge(modalAction);
  };

  return (
    <dialog
      open
      className="modal modal-bottom sm:modal-middle"
      onClose={() => setModalAction(undefined)}
    >
      <div className="modal-box sm:inline-table">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <h3 className="font-semibold text-2xl">
          Action Details{" "}
          {!modalAction.isCompleted ? (
            <div className="badge badge-warning ml-1">
              <ExclamationTriangleIcon className="w-4 h-4" />
              Not complete
            </div>
          ) : (
            <div className="badge badge-success ml-1">
              <CheckCircleIcon className="w-4 h-4" />
              Completed
            </div>
          )}
        </h3>
        <div className="divider my-2" />
        <table className="table table-zebra">
          <tbody className="[&>tr>th]:font-semibold [&>tr>td]:font-medium [&>tr>td]:pr-0 [&>tr>th]:pl-0">
            <tr>
              <td>
                <CalendarIcon className="w-5 h-5" />
              </td>
              <th>Entry Date & Time:</th>
              <td>
                {moment(modalAction.entryTimestamp).format(
                  "HH:mm | DD.MM.YYYY"
                )}
              </td>
            </tr>
            <tr>
              <td>
                <DocumentTextIcon className="w-5 h-5" />
              </td>
              <th>Entry Transaction:</th>
              <td className="flex-row flex items-center">
                <a
                  className="link "
                  href={`${sourceNetwork.explorerUrl}/transactions/${modalAction.entryTxHash}`}
                  target="_blank"
                >
                  {shorten(modalAction.entryTxHash!, 16, 4)}
                </a>
                <LinkIcon className="ml-0.5" width={12} height={12} />
              </td>
            </tr>
            <tr>
              <td>
                <BanknotesIcon className="w-5 h-5" />
              </td>
              <th>Token</th>
              <td>{modalAction.tokenName}</td>
            </tr>
            <tr>
              <td>
                <CircleStackIcon className="w-5 h-5" />
              </td>
              <th>Amount</th>
              <td>
                {formatBalance({
                  balance: modalAction.amount,
                  decimals: modalAction.tokenDecimals,
                  formatDecimals: 2,
                })}{" "}
                {modalAction.tokenSymbol}
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
              <td>{`${targetNetwork.name} (${targetNetwork.id})`}</td>
            </tr>
            {modalAction.isCompleted && (
              <>
                <tr>
                  <td>
                    <CalendarIcon className="w-5 h-5" />
                  </td>
                  <th>Entry Date & Time:</th>
                  <td>
                    {moment(modalAction.exitTimestamp).format(
                      "HH:mm | DD.MM.YYYY"
                    )}
                  </td>
                </tr>
                <tr>
                  <td>
                    <DocumentTextIcon className="w-5 h-5" />
                  </td>
                  <th>Exit Transaction:</th>
                  <td className="flex-row flex items-center">
                    <a
                      className="link "
                      href={`${targetNetwork.explorerUrl}/transactions/${modalAction.exitTxHash}`}
                      target="_blank"
                    >
                      {shorten(modalAction.exitTxHash!, 16, 4)}
                    </a>
                    <LinkIcon className="ml-0.5" width={12} height={12} />
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
        <div className="divider" />
        {!connectedToTargetNetwork && !modalAction.isCompleted && (
          <div className="alert alert-warning mb-5">
            <ExclamationCircleIcon className="w-6 h-6 mr-0.5" />
            <p>
              Switch to{" "}
              <span className="font-medium">{targetNetwork.name} Network</span>{" "}
              on your wallet to continue the bridging process.
            </p>
          </div>
        )}
        {!modalAction.isCompleted && (
          <button
            disabled={!connectedToTargetNetwork || isBusy}
            className="btn bg-aepink text-white font-medium w-[200px] mb-2 mt-2 flex justify-self-center"
            color="primary"
            onClick={handleBridgeComplete}
          >
            Complete Bridge
          </button>
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
