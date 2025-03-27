import { describe, expect, test } from "bun:test";

import {
  AE_TESTNET,
  AE_MAINNET,
  FungibleToken_aci,
} from "@aepp-hyperchain-bridge/shared";
import {
  Bridge,
  ExitRequest,
  BridgeEntry,
  BridgeEntryTx,
  TokenType,
  tokenTypeToStr,
  TokenLink,
} from "../utils/types";
import { getAccountAddress, setupContracts } from "../utils/setup-tests";
import { createMessage, createSignature } from "../utils/create-signature";
import { convertAllBigIntsToInts, mapNetwork } from "../utils/parsers";
import { Contract } from "@aeternity/aepp-sdk";
import {
  getOriginalTokenBalance,
  getTokenBalanceOfAccount,
  getTxFee,
  setAllowanceIfNeeded,
} from "../utils/token-utils";
import { sleep } from "bun";

const { BRIDGE_A, BRIDGE_B } = await setupContracts(AE_TESTNET, AE_MAINNET);

const [
  [resolveEntriesPromiseA, entriesPromiseA],
  [resolveEntriesPromiseB, entriesPromiseB],
  [resolveExitsPromiseB, exitsPromiseB],
] = Array(3)
  .fill("")
  .map(() => {
    let resolve: (value: boolean) => void = () => {};
    const promise: Promise<boolean> = new Promise((res) => {
      resolve = res;
    });
    return [resolve, promise];
  });

const executedEntries: { A: BridgeEntryTx[] } | { B: BridgeEntryTx[] } = {
  A: [],
  B: [],
};
const exitsToProcess: { A: ExitRequest[] } & { B: ExitRequest[] } = {
  A: [],
  B: [],
};

const ownerAddress = BRIDGE_A.sdk.addresses()[0] as `ak_${string}`;
const userAddress = BRIDGE_B.sdk.addresses()[1] as `ak_${string}`;
const depositAmount = 1e3;

describe("HyperchainBridge", async () => {
  let testsRan = 0;
  describe("entries on Network A", async () => {
    const { sdk, contract, token } = BRIDGE_A;

    test("Standard(AEX9) token entry", async () => {
      const bridgeBalanceBefore = parseInt(
        (await token.balance(getAccountAddress(contract))).decodedResult
      );
      const { decodedResult: entriesBefore } = await contract.bridge_entries();
      const { decodedResult: newEntry, hash } = await contract.enter_bridge(
        depositAmount,
        TokenType.Standard([]),
        mapNetwork(BRIDGE_B.network),
        token.$options.address
      );
      const bridgeBalance = parseInt(
        (await token.balance(getAccountAddress(contract))).decodedResult
      );
      const newBridgeEntry = convertAllBigIntsToInts(newEntry) as BridgeEntry;

      expect(bridgeBalance).toBe((bridgeBalanceBefore || 0) + depositAmount);
      expect(newBridgeEntry).toEqual({
        idx: entriesBefore.length,
        from: userAddress,
        amount: depositAmount,
        token: token.$options.address,
        target_network: mapNetwork(BRIDGE_B.network),
        token_type: TokenType.Standard([]),
        exit_link: undefined,
      });

      await saveEntry(newBridgeEntry, hash, BRIDGE_A);

      testsRan++;
      if (testsRan === 2) {
        resolveEntriesPromiseA(true);
      }
    });

    test("Native(AE) tokens entry", async () => {
      const bridgeBalanceBefore = parseInt(
        await sdk.getBalance(getAccountAddress(contract) as `ak_${string}`)
      );
      const { decodedResult: entriesBefore } = await contract.bridge_entries();
      const { decodedResult: newEntry, hash } = await contract.enter_bridge(
        depositAmount,
        TokenType.Native([]),
        mapNetwork(BRIDGE_B.network),
        undefined,
        {
          amount: depositAmount,
        }
      );
      const bridgeBalance = parseInt(
        await sdk.getBalance(getAccountAddress(contract) as `ak_${string}`)
      );
      const newBridgeEntry = convertAllBigIntsToInts(newEntry) as BridgeEntry;

      expect(bridgeBalance).toBe((bridgeBalanceBefore || 0) + depositAmount);
      expect(newBridgeEntry).toEqual({
        idx: entriesBefore.length,
        from: userAddress,
        amount: depositAmount,
        token: undefined,
        target_network: mapNetwork(BRIDGE_B.network),
        token_type: TokenType.Native([]),
        exit_link: undefined,
      });

      await saveEntry(newBridgeEntry, hash, BRIDGE_A);

      testsRan++;
      if (testsRan === 2) {
        resolveEntriesPromiseA(true);
      }
    });
  });

  describe("exits on Network B", async () => {
    test("verify exit request message", async () => {
      await entriesPromiseA;
      await testMessageEquality(BRIDGE_B, exitsToProcess.A[0]);
    });

    test(`bridge exits of Native and Standard tokens`, async () => {
      await entriesPromiseA;
      await testBridgeExits(BRIDGE_B, exitsToProcess.A);
      resolveExitsPromiseB(true);
    });
  });

  describe("entries on Network B", async () => {
    test("Link tokens entry", async () => {
      await exitsPromiseB;
      const { sdk, contract, network } = BRIDGE_B;

      const { decodedResult: tokenLinks } = await contract.token_links();
      for await (const _tokenLink of tokenLinks) {
        const tokenLink = _tokenLink as TokenLink;
        const userBalanceBefore = await getOriginalTokenBalance(
          tokenLink,
          sdk,
          userAddress
        );
        const gasSpentOnAllowance = await setAllowanceIfNeeded(
          tokenLink,
          userAddress,
          getAccountAddress(contract),
          BRIDGE_B
        );
        const { decodedResult: entries } = await contract.bridge_entries();
        const {
          hash,
          decodedResult: newEntry,
          result: { gasPrice, gasUsed },
        } = await contract.enter_bridge(
          depositAmount,
          TokenType.Link([]),
          mapNetwork(BRIDGE_A.network),
          tokenLink.local_token
        );
        const [userBalance, contractBalance] = await Promise.all(
          [userAddress, getAccountAddress(contract)].map((account) =>
            getOriginalTokenBalance(tokenLink, sdk, account)
          )
        );

        let totalFees = depositAmount;
        if (tokenLink.is_source_native) {
          const gasSpentDeposit = gasUsed * parseInt(gasPrice.toString());
          const txFee = await getTxFee(network, hash);
          totalFees = gasSpentDeposit + (gasSpentOnAllowance || 0) + txFee;
        }

        expect(contractBalance).toBe(0);
        expect(userBalance).toBe(userBalanceBefore - totalFees);
        expect(convertAllBigIntsToInts(newEntry)).toEqual({
          idx: entries.length,
          amount: depositAmount,
          from: userAddress,
          token: tokenLink.local_token,
          token_type: TokenType.Link([]),
          exit_link: tokenLink,
          target_network: mapNetwork(BRIDGE_A.network),
        });

        await saveEntry(newEntry, hash, BRIDGE_B);
        resolveEntriesPromiseB(true);
      }
    });
  });

  describe("exits on Network A", async () => {
    test("verify bridge exit request message", async () => {
      await entriesPromiseB;
      await testMessageEquality(BRIDGE_A, exitsToProcess.B[0]);
    });

    test(`bridge exits of Link tokens`, async () => {
      await entriesPromiseB;
      await testBridgeExits(BRIDGE_A, exitsToProcess.B);
    });
  });
});

const testBridgeExits = async (bridge: Bridge, exitRequests: ExitRequest[]) => {
  const { sdk, contract } = bridge;
  for await (const request of exitRequests) {
    const timestamp = Date.now();
    const signature = await createSignature(
      sdk,
      request,
      timestamp,
      ownerAddress
    );
    let exitTokenAddress = await retrieveExitTokenAddress(bridge, request);

    const userBalanceBefore = await getTokenBalanceOfAccount(
      exitTokenAddress,
      sdk,
      userAddress
    );

    const {
      hash,
      result: { gasPrice, gasUsed },
      decodedResult: exitLink,
    } = await contract.exit_bridge(request, timestamp, signature);
    const { decodedResult } = await contract.processed_exits();
    const processedExits = decodedResult.map(
      convertAllBigIntsToInts
    ) as ExitRequest[];

    if (!exitTokenAddress) {
      exitTokenAddress = (exitLink as TokenLink).local_token;
    }

    const userBalance = await getTokenBalanceOfAccount(
      exitTokenAddress,
      sdk,
      userAddress
    );

    let totalFees = 0;
    if (request.entry.exit_link?.is_source_native) {
      const gasSpentDeposit = gasUsed * parseInt(gasPrice.toString());
      const txFee = await getTxFee(bridge.network, hash);
      totalFees = gasSpentDeposit + txFee;
    }

    expect(processedExits.length).toBeGreaterThan(0);
    const lastExit = processedExits[processedExits.length - 1];
    expect(lastExit).toEqual(request);
    expect(userBalance).toBe(
      userBalanceBefore + request.entry.amount - totalFees
    );

    await sleep(1000);
  }
};

const retrieveExitTokenAddress = async (
  bridge: Bridge,
  request: ExitRequest
) => {
  if (tokenTypeToStr(request.entry.token_type) === "Link") {
    if (request.entry.exit_link?.is_source_native) {
      return "native";
    }
    return request.entry.exit_link?.source_token;
  } else {
    const { decodedResult } = await bridge.contract.find_token_link(request);
    return decodedResult ? (decodedResult as TokenLink).local_token : null;
  }
};

const testMessageEquality = async (bridge: Bridge, request: ExitRequest) => {
  const timestamp = Date.now();
  const message = createMessage(request, timestamp);
  const { decodedResult: contractMessage } =
    await bridge.contract.stringify_exit_request(request, timestamp);
  expect(contractMessage).toBe(message);
};

const saveEntry = async (
  entry: BridgeEntry,
  tx_hash: string,
  bridge: Bridge
) => {
  const dataIndex = bridge === BRIDGE_A ? "A" : "B";
  let entry_token_meta = bridge.tokenMeta;

  if (tokenTypeToStr(entry.token_type) === "Native") {
    entry_token_meta = {
      name: `${bridge.network.name} AE Token`,
      decimals: 18,
      symbol: "AE",
    };
  }

  if (tokenTypeToStr(entry.token_type) === "Link") {
    const linkedToken = await Contract.initialize({
      ...bridge.sdk.getContext(),
      address: entry.token as `ct_${string}`,
      aci: FungibleToken_aci,
    });
    entry_token_meta = (await linkedToken.meta_info()).decodedResult;
  }

  const newExitRequest = {
    entry,
    entry_token_meta,
    entry_tx_hash: tx_hash,
    entry_network: mapNetwork(bridge.network),
  };

  executedEntries[dataIndex].push(convertAllBigIntsToInts({ entry, tx_hash }));
  exitsToProcess[dataIndex].push(convertAllBigIntsToInts(newExitRequest));
};
