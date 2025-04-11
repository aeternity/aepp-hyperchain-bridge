import { useEffect } from "react";

import Title from "../base/title";
import BridgeHistoryList from "./history-list";
import useBridgeActionsHistory from "../../hooks/useBridgeActionsHistory";

interface Props {
  isContractBusy: boolean;
}

export default function BridgeHistory({ isContractBusy }: Props) {
  const { actions, isFetched, isFetching, refetch } = useBridgeActionsHistory();
  useEffect(() => {
    if (!isContractBusy) {
      refetch();
    }
  }, [isContractBusy, refetch]);
  const nonCompletedActions = actions.filter((a) => !a.isCompleted);
  return (
    <div className="drawer drawer-end">
      <input
        id="transaction-history-drawer"
        type="checkbox"
        className="drawer-toggle"
      />
      <div className="drawer-content text-center">
        <label
          htmlFor="transaction-history-drawer"
          className="drawer-button btn btn-link text-aepink"
        >
          View History
          {!isFetching && nonCompletedActions.length > 0 && (
            <div className="badge badge-sm badge-neutral bg-aepink border-white pt-0.5">
              {nonCompletedActions.length}
            </div>
          )}
          {isFetching && (
            <span className="loading-xs loading loading-spinner text-neutral"></span>
          )}
        </label>
      </div>
      <div className="drawer-side">
        <label
          htmlFor="transaction-history-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <div className="bg-base-200 text-base-content h-dvh w-100 max-sm:w-80 flex-col flex-1 overflow-hidden">
          <Title
            className="flex-col p-5 !m-0 h-28 shadow-lg"
            title="History"
            subtitle="History of your bridge transactions"
          />
          <div className="flex flex-1 flex-col overflow-scroll h-[calc(100%-7rem)]">
            {isFetched && <BridgeHistoryList actions={actions} />}
            {isFetching && (
              <div className="flex justify-center m-3">
                <span className="loading loading-spinner text-neutral"></span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
