import { createContext, useCallback, useContext, useState } from "react";
import { NotificationContext } from "./notification-provider";
import { walletSdk } from "../utils/wallet-sdk";
import { getBridgeContract } from "@/utils/contract/helper";
import { BridgeAction } from "@/types/bridge";
import { Token } from "@/types/token";
import { setTokenAllowance } from "../utils/token-helper";
import { WalletContext } from "./wallet-provider";

type Props = {
  children: React.ReactNode;
};

export const BridgeActionContext = createContext({
  isBusy: false,
  modalAction: undefined as BridgeAction | undefined,
  isHistoryVisible: false,
  setHistoryVisibility: (show: boolean) => {},
  exitBridge: async (action: BridgeAction): Promise<[boolean, any]> =>
    new Promise((resolve) => resolve([false, null])),
  enterBridge: async (
    destinationNetworkId: string,
    token: Token,
    amount: string
  ): Promise<[boolean, any]> =>
    new Promise((resolve) => resolve([false, null])),
  setModalAction: (action: BridgeAction | undefined) => {},
});

export default function BridgeActionProvider({ children }: Props) {
  const { showError, showInfo, showSuccess } = useContext(NotificationContext);
  const { getNetworkById, currentNetwork } = useContext(WalletContext);

  const [isBusy, setBusy] = useState(false);
  const [modalAction, setModalAction] = useState<BridgeAction>();
  const [isHistoryVisible, setHistoryVisibility] = useState(false);

  const enterBridge = useCallback(
    async (
      destinationNetworkId: string,
      token: Token,
      amount: string
    ): Promise<[boolean, any]> => {
      setBusy(true);
      try {
        if (!currentNetwork) throw new Error("Network not found");

        const bridgeContract = await getBridgeContract(
          walletSdk,
          currentNetwork.bridgeContractAddress as `ct_${string}`
        );
        const isNative = token.address === "native";

        if (!isNative) {
          const alreadySet = await setTokenAllowance(
            amount,
            token.address,
            walletSdk.address,
            bridgeContract?.$options.address!
          );
          if (!alreadySet) showInfo("Allowance is set successfully");
        }

        const result = await bridgeContract?.enter_bridge(
          BigInt(amount),
          destinationNetworkId,
          isNative ? undefined : token.address,
          {
            ttl: 30,
            amount: isNative ? BigInt(amount) : undefined,
            omitUnknown: true,
          }
        );

        const newEntryAction = await syncBridgeAction(
          currentNetwork.id,
          result.hash
        );

        if (newEntryAction) {
          setModalAction(newEntryAction);
        } else {
          showError(
            "Cannot fetch entry action details, please check the history later."
          );
        }

        setBusy(false);
        return [true, result];
      } catch (error: any) {
        setBusy(false);
        showError(error.message);
        return [false, error as any];
      }
    },
    [currentNetwork?.id, showError, showInfo, showSuccess]
  );

  const exitBridge = useCallback(
    async (action: BridgeAction): Promise<[boolean, any]> => {
      setBusy(true);
      try {
        if (!currentNetwork) throw new Error("Network not found");

        const bridgeContract = await getBridgeContract(
          walletSdk,
          currentNetwork.bridgeContractAddress as `ct_${string}`
        );
        const sourceNetwork = getNetworkById(action.sourceNetworkId)!;
        const _resp = await fetch(
          `/api/signature/${encodeURIComponent(sourceNetwork.url)}/${
            sourceNetwork.bridgeContractAddress
          }/${action.entryIdx}/${action.entryTxHash}`
        );
        const { ok, error, signature, exitRequest, timestamp } =
          await _resp.json();

        if (!ok) throw new Error(error);

        const exitTx = await bridgeContract?.exit_bridge(
          exitRequest,
          timestamp,
          signature,
          {
            ttl: 30,
            omitUnknown: true,
          }
        );

        const remoteActionData = await syncBridgeAction(
          currentNetwork.id,
          exitTx.hash
        );

        if (remoteActionData?.isCompleted) {
          setModalAction(remoteActionData);
        } else {
          showError(
            "Cannot process exit transaction details, please check the history later."
          );
        }

        setBusy(false);
        return [true, exitTx];
      } catch (error: any) {
        setBusy(false);
        showError(error.message);
        return [false, null];
      }
    },
    [currentNetwork?.id]
  );

  return (
    <BridgeActionContext.Provider
      value={{
        isBusy,
        modalAction,
        isHistoryVisible,
        setHistoryVisibility,
        exitBridge,
        enterBridge,
        setModalAction,
      }}
    >
      {children}
    </BridgeActionContext.Provider>
  );
}

const syncBridgeAction = async (
  networkId: string,
  hash: string
): Promise<BridgeAction | null> => {
  const { ok, data, error } = await fetch(
    `/api/actions/sync/${networkId}/${hash}`
  ).then((res) => res.json());

  if (!ok) {
    console.error(error);
    return null;
  }

  return data;
};
