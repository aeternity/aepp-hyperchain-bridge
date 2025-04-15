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
  const { getNetworkById, getNetworkBaseById, currentNetwork } =
    useContext(WalletContext);
  const { showError, showInfo, showSuccess } = useContext(NotificationContext);

  const [isBusy, setBusy] = useState(false);
  const [modalAction, setModalAction] = useState<BridgeAction>();

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
        const network = getNetworkBaseById(destinationNetworkId);

        const result = await bridgeContract?.enter_bridge(
          BigInt(amount),
          network,
          isNative ? undefined : token.address,
          {
            ttl: 30,
            amount: isNative ? BigInt(amount) : undefined,
          }
        );

        showSuccess(`Bridge entry is successful with tx hash: ${result?.hash}`);

        const newEntryAction = await fetchBridgeAction(
          currentNetwork.id,
          Number(result.decodedResult.idx),
          1000
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
          }
        );

        showSuccess(
          `Exit bridge transaction is successful with tx hash: ${exitTx?.hash}`
        );

        showInfo(`Fetching exit transaction details. Please wait...`);

        const remoteActionData = await fetchBridgeAction(
          sourceNetwork.id,
          action.entryIdx,
          1000
        );

        if (remoteActionData?.isCompleted) {
          setModalAction(remoteActionData);
        } else {
          showError(
            "Cannot fetch exit transaction details, please check the history later."
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
      value={{ isBusy, modalAction, exitBridge, enterBridge, setModalAction }}
    >
      {children}
    </BridgeActionContext.Provider>
  );
}

const fetchBridgeAction = async (
  sourceNetworkId: string,
  entryIdx: number,
  timeout = 0
): Promise<BridgeAction | null> => {
  return new Promise(async (resolve, reject) => {
    setTimeout(async () => {
      const { ok, data, error } = await fetch(
        `/api/action/${sourceNetworkId}/${entryIdx}`
      ).then((res) => res.json());

      if (!ok) reject(error);

      resolve(data);
    }, timeout);
  });
};
