import { useCallback, useContext, useState } from "react";
import Title from "../base/title";
import UrlInput from "./url-input";
import { isValidURL } from "../../utils/validators";
import { NotificationContext } from "../../context/notification-provider";
import DeployContractModal from "./deploy-contract-modal";
import { NetworkWithCurrency } from "@/types/network";
import { normalizeUrls } from "../../utils/formatters";

export default function NetworkForm() {
  const { showError } = useContext(NotificationContext);

  const [mdw, setMdw] = useState("");
  const [node, setNode] = useState("");
  const [mdwWS, setMdwWS] = useState("");
  const [explorer, setExplorer] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [network, setNetwork] = useState<NetworkWithCurrency>();

  const isButtonEnabled =
    isValidURL(node) &&
    isValidURL(mdw) &&
    isValidURL(mdwWS) &&
    isValidURL(explorer);

  const handleVerifyClick = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      setIsVerifying(true);
      const formData = normalizeUrls({ node, mdw, mdwWS, explorer });
      const resp = await fetch(`/api/networks/verify`, {
        method: "POST",
        body: JSON.stringify(formData),
      }).then((res) => res.json());

      if (resp.ok) {
        setNetwork({
          id: resp.networkId,
          name: resp.networkName,
          url: formData.node,
          mdwUrl: formData.mdw,
          mdwWebSocketUrl: formData.mdwWS,
          explorerUrl: formData.explorer,
          bridgeContractAddress: "",
          currency: resp.currency,
          statusSucceeded: true,
        });
      } else {
        showError(resp.error);
        setNetwork(undefined);
      }
      setIsVerifying(false);
    },
    [node, mdw, mdwWS, explorer]
  );

  return (
    <>
      <Title
        title="Identify Hyperchain"
        subtitle="You've connected to an unsupported network. Please identify your Hyperchain's details to proceed."
      />

      <fieldset className="fieldset rounded-sm bg-gray-50 shadow-sm pt-3">
        <div className=" flex flex-1 flex-row flex-wrap ">
          <UrlInput value={node} setValue={setNode} title="Node URL" />
          <UrlInput value={mdw} setValue={setMdw} title="Middleware URL" />
          <UrlInput
            value={mdwWS}
            setValue={setMdwWS}
            title="Middleware WebSocket URL"
          />
          <UrlInput
            value={explorer}
            setValue={setExplorer}
            title="Explorer URL"
          />

          <button
            disabled={!isButtonEnabled || isVerifying}
            className="btn bg-aepink text-white font-medium w-[200px] mb-5 mt-2 m-auto"
            color="primary"
            onClick={handleVerifyClick}
          >
            {isVerifying ? "Verifying..." : "Verify Network"}
          </button>
        </div>
      </fieldset>
      {network && (
        <DeployContractModal
          network={network}
          onClose={() => setNetwork(undefined)}
        />
      )}
    </>
  );
}
