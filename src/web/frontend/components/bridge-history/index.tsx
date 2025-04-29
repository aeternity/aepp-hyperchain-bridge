import { useContext, useEffect } from "react";

import Title from "../base/title";
import BridgeHistoryList from "./history-list";
import { BridgeActionContext } from "../../context/action-provider";
import useBridgeActionsHistory from "../../hooks/useBridgeActionsHistory";

export default function BridgeHistory() {
  const { isBusy, isHistoryVisible, setHistoryVisibility } =
    useContext(BridgeActionContext);
  const { actions, isFetched, isFetching, refetch } = useBridgeActionsHistory();

  useEffect(() => {
    if (!isBusy && !isFetching) {
      refetch();
    }
  }, [isBusy, refetch]);

  return (
    <div className="drawer drawer-end z-20">
      <input
        id="transaction-history-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={isHistoryVisible}
        onChange={(e) => setHistoryVisibility(e.target.checked)}
      />
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
