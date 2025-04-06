import { describe, expect, test } from "bun:test";

import { AE_TESTNET, AE_MAINNET } from "@/constants/networks";
import {
  BridgeTestSetup,
  ExitRequest,
  BridgeEntry,
  BridgeEntryTx,
  TokenType,
  tokenTypeToStr,
  TokenLink,
} from "@/types/bridge";
import {
  getContractAccountAddress,
  setupContracts,
} from "@/utils/test/setup-tests";
import {
  createMessage,
  createSignature,
} from "@/utils/signature/create-signature";
import { mapNetworkToBase } from "@/utils/data/mappers";
import { Contract } from "@aeternity/aepp-sdk";
import {
  getOriginalTokenBalance,
  getTokenBalanceOfAccount,
  getTxFee,
  setAllowanceIfNeeded,
} from "@/utils/contract/token";
import { sleep } from "bun";
import FungibleToken_aci from "@/aci/FungibleToken.json";

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

const executedEntries: { A: BridgeEntryTx[] } & { B: BridgeEntryTx[] } = {
  A: [],
  B: [],
};
const exitsToProcess: { A: ExitRequest[] } & { B: ExitRequest[] } = {
  A: [],
  B: [],
};

const ownerAddress = BRIDGE_A.sdk.addresses()[0] as `ak_${string}`;
const userAddress = BRIDGE_B.sdk.addresses()[1] as `ak_${string}`;
const depositAmount = BigInt(1e6);

describe("HyperchainBridge", async () => {
  let testsRan = 0;
  describe("entries on Network A", async () => {
    const { sdk, contract, token, network } = BRIDGE_A;

    test("Standard(AEX9) token entry", async () => {
      const bridgeBalanceBefore = BigInt(
        (await token.balance(getContractAccountAddress(contract)))
          .decodedResult || 0
      );
      const { decodedResult: entriesBefore } = await contract.bridge_entries();
      const { decodedResult: newEntry, hash } = await contract.enter_bridge(
        depositAmount,
        mapNetworkToBase(BRIDGE_B.network),
        token.$options.address
      );
      const bridgeBalance = BigInt(
        (await token.balance(getContractAccountAddress(contract))).decodedResult
      );

      expect(bridgeBalance).toBe(
        (bridgeBalanceBefore || BigInt(0)) + depositAmount
      );
      expect(newEntry as BridgeEntry).toEqual({
        idx: BigInt(entriesBefore.length),
        from: userAddress,
        amount: depositAmount,
        token: token.$options.address,
        target_network: mapNetworkToBase(BRIDGE_B.network),
        token_type: TokenType.Standard,
        exit_link: undefined,
        source_network_id: network.id,
      });

      await saveEntry(newEntry, hash, BRIDGE_A);

      testsRan++;
      if (testsRan === 2) {
        resolveEntriesPromiseA(true);
      }
    });

    test("Native(AE) tokens entry", async () => {
      const bridgeBalanceBefore = BigInt(
        (await sdk.getBalance(
          getContractAccountAddress(contract) as `ak_${string}`
        )) || 0
      );
      const { decodedResult: entriesBefore } = await contract.bridge_entries();
      const { decodedResult: newEntry, hash } = await contract.enter_bridge(
        depositAmount,
        mapNetworkToBase(BRIDGE_B.network),
        undefined,
        {
          amount: depositAmount,
        }
      );
      const bridgeBalance = BigInt(
        await sdk.getBalance(
          getContractAccountAddress(contract) as `ak_${string}`
        )
      );

      expect(bridgeBalance).toBe(
        (bridgeBalanceBefore || BigInt(0)) + depositAmount
      );
      expect(newEntry as BridgeEntry).toEqual({
        idx: BigInt(entriesBefore.length),
        from: userAddress,
        amount: depositAmount,
        token: undefined,
        target_network: mapNetworkToBase(BRIDGE_B.network),
        token_type: TokenType.Native,
        exit_link: undefined,
        source_network_id: network.id,
      });

      await saveEntry(newEntry, hash, BRIDGE_A);

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
          getContractAccountAddress(contract),
          BRIDGE_B
        );
        const { decodedResult: entries } = await contract.bridge_entries();
        const {
          hash,
          decodedResult: newEntry,
          result,
        } = await contract.enter_bridge(
          depositAmount,
          mapNetworkToBase(BRIDGE_A.network),
          tokenLink.local_token
        );
        const { gasPrice, gasUsed } = result!;
        const [userBalance, contractBalance] = await Promise.all(
          [userAddress, getContractAccountAddress(contract)].map((account) =>
            getOriginalTokenBalance(tokenLink, sdk, account)
          )
        );

        let totalFees = depositAmount;
        if (tokenLink.is_source_native) {
          const gasSpentDeposit = BigInt(gasUsed) * BigInt(gasPrice.toString());
          const txFee = BigInt(await getTxFee(network, hash));
          totalFees =
            gasSpentDeposit + BigInt(gasSpentOnAllowance || 0) + txFee;
        }

        expect(contractBalance).toBe(BigInt(0));
        expect(userBalance).toBe(userBalanceBefore - totalFees);
        expect(newEntry as BridgeEntry).toEqual({
          idx: BigInt(entries.length),
          amount: depositAmount,
          from: userAddress,
          token: tokenLink.local_token,
          token_type: TokenType.Link,
          exit_link: tokenLink,
          target_network: mapNetworkToBase(BRIDGE_A.network),
          source_network_id: network.id,
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

const testBridgeExits = async (
  bridge: BridgeTestSetup,
  exitRequests: ExitRequest[]
) => {
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
      result,
      decodedResult: exitLink,
    } = await contract.exit_bridge(request, timestamp, signature);
    const { gasPrice, gasUsed } = result!;
    const { decodedResult: processedExits } = await contract.processed_exits();

    if (!exitTokenAddress) {
      exitTokenAddress = (exitLink as TokenLink).local_token;
    }

    const userBalance = await getTokenBalanceOfAccount(
      exitTokenAddress,
      sdk,
      userAddress
    );

    let totalFees = BigInt(0);
    if (request.entry.exit_link?.is_source_native) {
      const gasSpentDeposit = BigInt(gasUsed) * BigInt(gasPrice.toString());
      const txFee = BigInt(await getTxFee(bridge.network, hash));
      totalFees = gasSpentDeposit + txFee;
    }

    expect(processedExits.length).toBeGreaterThan(0);
    const lastExit = processedExits[processedExits.length - 1];
    expect(lastExit).toEqual(request);
    expect(userBalance).toBe(
      userBalanceBefore + request.entry.amount - totalFees
    );

    await sleep(2000);
  }
};

const retrieveExitTokenAddress = async (
  bridge: BridgeTestSetup,
  request: ExitRequest
) => {
  if (tokenTypeToStr(request.entry.token_type) === "Link") {
    if (request.entry.exit_link?.is_source_native) {
      return "native";
    }
    return request.entry.exit_link?.source_token;
  } else {
    const { decodedResult } = await bridge.contract.find_token_link(request);
    return decodedResult ? (decodedResult as TokenLink).local_token : undefined;
  }
};

const testMessageEquality = async (
  bridge: BridgeTestSetup,
  request: ExitRequest
) => {
  const timestamp = Date.now();
  const message = createMessage(request, timestamp);
  const { decodedResult: contractMessage } =
    await bridge.contract.stringify_exit_request(request, timestamp);
  expect(contractMessage).toBe(message);
};

const saveEntry = async (
  entry: BridgeEntry,
  tx_hash: string,
  bridge: BridgeTestSetup
) => {
  const dataIndex = bridge === BRIDGE_A ? "A" : "B";
  let entry_token_meta = bridge.tokenMeta;

  if (tokenTypeToStr(entry.token_type) === "Native") {
    entry_token_meta = {
      name: `${bridge.network.name} AE Token`,
      decimals: BigInt(18),
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
    entry_network: mapNetworkToBase(bridge.network),
  };

  executedEntries[dataIndex].push({
    ...entry,
    hash: tx_hash,
    timestamp: Date.now(),
  });
  exitsToProcess[dataIndex].push(newExitRequest);
};
