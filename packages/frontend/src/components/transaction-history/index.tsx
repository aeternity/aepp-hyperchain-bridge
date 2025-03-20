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
        <div className="bg-base-200 text-base-content min-h-full w-100 p-4">
          <Title
            title="History"
            subtitle="History of your bridge transactions"
          />

          {isFetched && (
            <TransactionList isFetching={isFetching} deposits={deposits} />
          )}
          <div ref={ref}></div>
        </div>
      </div>
    </div>
  );
}
