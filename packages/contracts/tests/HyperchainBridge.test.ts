import { afterAll, beforeEach, describe, expect, test } from "bun:test";

import {
  AE_TESTNET,
  AE_MAINNET,
  FungibleToken_aci,
} from "@aepp-hyperchain-bridge/shared";
import {
  Bridge,
  Claim,
  Deposit,
  DepositTx,
  TokenType,
  tokenTypeToStr,
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
  [resolveDepositsA, depositsPromiseA],
  [resolveDepositsB, depositsPromiseB],
  [resolveClaimsB, claimsPromiseB],
  [resolveClaimsA, claimsPromiseA],
] = Array(4)
  .fill("")
  .map((_, i) => {
    let resolve: (value: boolean) => void = () => {};
    const promise: Promise<boolean> = new Promise((res) => {
      resolve = res;
    });
    return [resolve, promise];
  });

const executedDeposits: DepositTx[][] = [[], []];
const claimsToExecute: Claim[][] = [[], []];

const ownerAddress = BRIDGE_A.sdk.addresses()[0] as `ak_${string}`;
const userAddress = BRIDGE_B.sdk.addresses()[1] as `ak_${string}`;
const depositAmount = 1e6;

describe("HyperchainBridge A<>B", async () => {
  describe("Deposits on BridgeA", async () => {
    const { sdk, contract, token, tokenMeta } = BRIDGE_A;

    afterAll(() => {
      resolveDepositsA(true);
    });

    test("user should be able to deposit Standard(AEX9) tokens", async () => {
      const { decodedResult: bridgeBalanceBefore } = await token.balance(
        getAccountAddress(contract)
      );

      const { decodedResult: depositsBefore } = await contract.deposits();
      const { decodedResult: depositIndex, hash } = await contract.deposit(
        mapNetwork(BRIDGE_B.network),
        depositAmount,
        tokenMeta.id,
        TokenType.Standard([])
      );
      expect(depositIndex).toBe(BigInt(depositsBefore.length));

      const { decodedResult: deposits } = await contract.deposits();
      const { decodedResult: bridgeContractBalance } = await token.balance(
        getAccountAddress(contract)
      );

      expect(bridgeContractBalance).toBe(
        (bridgeBalanceBefore || BigInt(0)) + BigInt(depositAmount)
      );
      const idx = deposits.length - 1;
      const deposit: Deposit = {
        idx: idx,
        from: userAddress,
        amount: depositAmount,
        token: token.$options.address,
        for_network: mapNetwork(BRIDGE_B.network),
        token_type: TokenType.Standard([]),
        original_token: undefined,
      };
      expect(convertAllBigIntsToInts(deposits[idx])).toEqual(deposit);
      await saveDeposit(deposit, hash, BRIDGE_A);
    });

    test("user should be able to deposit NATIVE(AE) tokens", async () => {
      const contractBalanceBefore = await sdk.getBalance(
        getAccountAddress(contract) as `ak_${string}`
      );

      const { decodedResult: depositsBefore } = await contract.deposits();
      const { decodedResult: depositIndex, hash } = await contract.deposit(
        mapNetwork(BRIDGE_B.network),
        depositAmount,
        undefined,
        TokenType.Native([]),
        {
          amount: depositAmount,
        }
      );
      expect(depositIndex).toBe(BigInt(depositsBefore.length));

      const { decodedResult: deposits } = await contract.deposits();
      const contractBalance = await sdk.getBalance(
        getAccountAddress(contract) as `ak_${string}`
      );
      expect(BigInt(contractBalance)).toBe(
        BigInt(contractBalanceBefore) + BigInt(depositAmount)
      );

      const idx = deposits.length - 1;
      const deposit: Deposit = {
        idx: idx,
        token: undefined,
        from: userAddress,
        amount: depositAmount,
        original_token: undefined,
        token_type: TokenType.Native([]),
        for_network: mapNetwork(BRIDGE_B.network),
      };
      expect(convertAllBigIntsToInts(deposits[idx])).toEqual(deposit);
      await saveDeposit(deposit, hash, BRIDGE_A);
    });
  });

  describe("Claims on BridgeB", async () => {
    beforeEach(async () => {
      await depositsPromiseA;
    });

    afterAll(() => {
      resolveClaimsB(true);
    });

    test("verify claim arg message", async () => {
      await testMessageEquality(BRIDGE_B, claimsToExecute[0][0]);
    });

    test(`user should be able to claim NetworkA deposits on NetworkB`, async () => {
      await testClaims(BRIDGE_B, claimsToExecute[0]);
    });
  });

  describe("Deposits on BridgeB", async () => {
    const { sdk, contract, network } = BRIDGE_B;
    beforeEach(async () => {
      await claimsPromiseB;
    });

    afterAll(async () => {
      resolveDepositsB(true);
    });

    test("user should be able to deposit Child(deployed by bridge) tokens", async () => {
      const { decodedResult: child_tokens } = await contract.child_tokens();
      for await (const child_token of child_tokens) {
        const [userBalanceBefore, contractBalanceBefore] = await Promise.all(
          [userAddress, getAccountAddress(contract)].map((account) =>
            getOriginalTokenBalance(child_token, sdk, account)
          )
        );

        const gasSpentAllowance = await setAllowanceIfNeeded(
          child_token,
          userAddress,
          getAccountAddress(contract),
          BRIDGE_B
        );

        const {
          hash,
          decodedResult: depositIndex,
          result: { gasPrice, gasUsed },
        } = await contract.deposit(
          mapNetwork(BRIDGE_A.network),
          depositAmount,
          child_token.ct,
          TokenType.Child([])
        );

        const [userBalance, contractBalance] = await Promise.all(
          [userAddress, getAccountAddress(contract)].map((account) =>
            getOriginalTokenBalance(child_token, sdk, account)
          )
        );

        let totalFees = depositAmount;
        if (child_token.is_native) {
          const gasSpentDeposit = gasUsed * parseInt(gasPrice.toString());
          const txFee = await getTxFee(network, hash);
          totalFees = gasSpentDeposit + (gasSpentAllowance || 0) + txFee;
        }

        expect(contractBalance).toBe(0);
        expect(userBalance).toBe(userBalanceBefore - totalFees);

        const deposit: Deposit = {
          idx: parseInt(depositIndex),
          amount: depositAmount,
          from: userAddress,
          token: child_token.ct,
          token_type: TokenType.Child([]),
          original_token: child_token,
          for_network: mapNetwork(BRIDGE_A.network),
        };
        await saveDeposit(deposit, hash, BRIDGE_B);
      }
    });
  });

  describe("Claims on BridgeA", async () => {
    beforeEach(async () => {
      await depositsPromiseB;
    });

    afterAll(async () => {
      resolveClaimsA(true);
    });

    test("verify claim arg message", async () => {
      await testMessageEquality(BRIDGE_A, claimsToExecute[1][0]);
    });

    test(`user should be able to claim NetworkB deposits on NetworkA`, async () => {
      await testClaims(BRIDGE_A, claimsToExecute[1]);
    });
  });
});

const testClaims = async (bridge: Bridge, claimsToTest: Claim[]) => {
  const { sdk, contract } = bridge;
  for await (const claimArg of claimsToTest) {
    const timestamp = Date.now();
    const signature = await createSignature(
      sdk,
      claimArg,
      timestamp,
      ownerAddress
    );

    let outTokenAddress = await getOutTokenAddress(bridge, claimArg);

    const userBalanceBefore = await getTokenBalanceOfAccount(
      outTokenAddress,
      sdk,
      userAddress
    );

    const {
      hash,
      result: { gasPrice, gasUsed },
      decodedResult: childToken,
    } = await contract.claim(claimArg, timestamp, signature);
    const { decodedResult: claims } = await contract.claims();

    if (!outTokenAddress) {
      outTokenAddress = childToken.ct;
    }

    const userBalance = await getTokenBalanceOfAccount(
      outTokenAddress,
      sdk,
      userAddress
    );

    let totalFees = 0;
    if (claimArg.deposit.original_token?.is_native) {
      const gasSpentDeposit = gasUsed * parseInt(gasPrice.toString());
      const txFee = await getTxFee(bridge.network, hash);
      totalFees = gasSpentDeposit + txFee;
    }

    expect(claims.length).toBeGreaterThan(0);
    const lastClaim = convertAllBigIntsToInts(claims[claims.length - 1]);
    expect(lastClaim).toEqual(claimArg);
    expect(userBalance).toBe(
      userBalanceBefore + claimArg.deposit.amount - totalFees
    );

    await sleep(500);
  }
};

const getOutTokenAddress = async (bridge: Bridge, claimArg: Claim) => {
  if (tokenTypeToStr(claimArg.deposit.token_type) === "Child") {
    if (claimArg.deposit.original_token?.is_native) {
      return "native";
    }
    return claimArg.deposit.original_token?.original_token;
  } else {
    const { decodedResult } = await bridge.contract.search_child_token(
      claimArg
    );
    return decodedResult ? decodedResult.ct : null;
  }
};

const testMessageEquality = async (bridge: Bridge, claim: Claim) => {
  const timestamp = Date.now();
  const message = createMessage(claim, timestamp);
  const { decodedResult: contractMessage } = await bridge.contract.claim_to_msg(
    claim,
    timestamp
  );
  expect(contractMessage).toBe(message);
};

const saveDeposit = async (
  deposit: Deposit,
  tx_hash: string,
  bridge: Bridge
) => {
  const dataIndex = bridge === BRIDGE_A ? 0 : 1;
  let deposit_token_meta = bridge.tokenMeta;

  if (tokenTypeToStr(deposit.token_type) === "Native") {
    deposit_token_meta = {
      id: undefined,
      name: `${bridge.network.name} AE Token`,
      decimals: 18,
      symbol: "AE",
    };
  }

  if (tokenTypeToStr(deposit.token_type) === "Child") {
    const childTokenCt = await Contract.initialize({
      ...bridge.sdk.getContext(),
      address: deposit.token as `ct_${string}`,
      aci: FungibleToken_aci,
    });
    const { decodedResult: meta } = await childTokenCt.meta_info();
    deposit_token_meta = {
      id: deposit.token,
      ...convertAllBigIntsToInts(meta),
    };
  }

  executedDeposits[dataIndex].push({ deposit, tx_hash });

  const newClaimArgs = {
    deposit,
    deposit_network: mapNetwork(bridge.network),
    deposit_tx_hash: tx_hash,
    deposit_token_meta,
  };
  claimsToExecute[dataIndex].push(newClaimArgs);
};
