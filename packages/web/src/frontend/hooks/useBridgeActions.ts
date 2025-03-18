import { useCallback, useContext, useState } from "react";
import useBridgeContract from "./useBridgeContract";
import { AppContext } from "../context/app-provider";
import { setTokenAllowance } from "../utils/contract";
import { walletSdk } from "../utils/wallet-sdk";

const useBridgeActions = () => {
  const { bridgeContract } = useBridgeContract();
  const { showError, showInfo, showSuccess } = useContext(AppContext);
  const [isActionInProgress, setIsActionInProgress] = useState(false);

  const deposit = useCallback(
    async (
      destinationNetworkId: string,
      tokenAddress: string,
      amount: string
    ) => {
      setIsActionInProgress(true);
      try {
        const alreadySet = await setTokenAllowance(
          amount,
          tokenAddress,
          walletSdk.address,
          bridgeContract.$options.address!
        );
        if (!alreadySet) showInfo("Allowance is set successfully");
        const result = await bridgeContract.deposit(
          destinationNetworkId,
          tokenAddress,
          amount
        );

        showSuccess(
          `Deposit ID:${result.decodedResult} is successful with tx hash: ${result.hash}`
        );
        return true;
      } catch (error) {
        showError(error.message);
        return false;
      } finally {
        setIsActionInProgress(false);
      }
    },
    [bridgeContract, showError, showInfo, showSuccess]
  );

  return {
    isActionInProgress,
    deposit,
  };
};

export default useBridgeActions;
