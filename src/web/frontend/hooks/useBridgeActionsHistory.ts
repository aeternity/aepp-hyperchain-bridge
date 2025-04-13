import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { WalletContext } from "../context/wallet-provider";
import { BridgeAction } from "@/types/bridge";

export default function useBridgeActionsHistory() {
  const { address } = useContext(WalletContext);

  const { data, isFetching, isFetched, refetch } = useQuery({
    queryKey: ["actions-history", address],
    queryFn: () => fetch(`/api/actions/${address}`).then((r) => r.json()),
    enabled: !!address,
    initialData: { data: [] },
  });

  if (data.error) {
    console.error("Error fetching actions history:", data.error);
  }

  const actions: BridgeAction[] = data.ok ? data.data : [];

  return {
    actions,
    isFetching,
    isFetched,
    refetch,
  };
}
