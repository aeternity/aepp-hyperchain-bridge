import React, { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";

import useDepositsData from "@/hooks/useDepositsData";
import Title from "../base/title";
import TransactionList from "./transaction-list";

export default function TransactionHistory() {
  const { ref, inView } = useInView();
  const { deposits, isFetched, isFetching, fetchNextPage } = useDepositsData();

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

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
          View History{" "}
          <div className="badge badge-sm badge-neutral bg-aepink border-white pt-0.5">
            1
          </div>
        </label>
      </div>
      <div className="drawer-side">
        <label
          htmlFor="transaction-history-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <div className="bg-base-200 text-base-content h-dvh w-100 flex-col flex-1 overflow-hidden">
          <Title
            className="flex-col p-5 !m-0 h-28 shadow-lg"
            title="History"
            subtitle="History of your bridge transactions"
          />
          <div className="flex flex-1 flex-col overflow-scroll h-[calc(100%-7rem)]">
            {isFetched && (
              <TransactionList isFetching={isFetching} deposits={deposits} />
            )}
            <div ref={ref}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
