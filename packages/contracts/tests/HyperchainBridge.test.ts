import { describe, expect, test, beforeEach, beforeAll } from "bun:test";

import { createSdkInstance, AE_TESTNET } from "@aepp-hyperchain-bridge/shared";
import { setupContracts } from "..";

describe("HyperchainBridge", async () => {
  const aeSdk = await createSdkInstance(AE_TESTNET);
  const {
    Bridge,
    TestToken,
    userAddress,
    ownerAddress,
    bridgeAddress,
    testTokenAddress,
    bridgeAccountAddress,
  } = await setupContracts(aeSdk);

  describe("Deposits", async () => {
    beforeEach(async () => {
      aeSdk.selectAccount(userAddress);
    });

    test("user should be able to deposit tokens to the bridge", async () => {
      const { decodedResult: bridgeContractBalanceBefore } =
        await TestToken.balance(bridgeAccountAddress);

      const { decodedResult: depositsBefore } = await Bridge.deposits();
      const { decodedResult: depositIndex } = await Bridge.deposit(
        "aehc_perf",
        testTokenAddress,
        10e18
      );
      expect(depositIndex).toBe(BigInt(depositsBefore.length));

      const { decodedResult: deposits } = await Bridge.deposits();
      const { decodedResult: bridgeContractBalance } = await TestToken.balance(
        bridgeAccountAddress
      );

      expect(bridgeContractBalance).toBe(
        bridgeContractBalanceBefore + BigInt(10e18)
      );
      expect(deposits[deposits.length - 1]).toEqual({
        from: userAddress,
        amount: BigInt(10e18),
        for_network: "aehc_perf",
        token: testTokenAddress,
        index: BigInt(deposits.length - 1),
      });
    });

    test("user should not be able to deposit if the specified token is not registered", async () => {
      await expect(
        Bridge.deposit("aehc_perf", bridgeAddress, 10e18)
      ).rejects.toThrow("TOKEN_NOT_REGISTERED");
    });

    test("user should not be able to deposit if the specified network is not registered", async () => {
      await expect(
        Bridge.deposit("mainnet", testTokenAddress, 10e18)
      ).rejects.toThrow("NETWORK_NOT_REGISTERED");
    });
  });

  describe("Withdraws", async () => {
    beforeAll(async () => {
      aeSdk.selectAccount(userAddress);
      await Bridge.deposit("aehc_perf", testTokenAddress, 3e18);
    });

    test("owner should be able to withdraw tokens from the bridge", async () => {
      const { decodedResult: userBalanceBefore } = await TestToken.balance(
        userAddress
      );

      aeSdk.selectAccount(ownerAddress);
      await Bridge.withdraw("aehc_perf", testTokenAddress, userAddress, 3e18);

      const { decodedResult: withdraws } = await Bridge.withdraws();
      const { decodedResult: userBalanceAfterWithdraw } =
        await TestToken.balance(userAddress);

      expect(userBalanceAfterWithdraw).toBe(userBalanceBefore + BigInt(3e18));
      expect(withdraws[withdraws.length - 1]).toEqual({
        recipient: userAddress,
        amount: BigInt(3e18),
        from_network: "aehc_perf",
        token: testTokenAddress,
      });
    });

    test("user without owner privileges should not be able to withdraw tokens from the bridge", async () => {
      aeSdk.selectAccount(userAddress);
      await expect(
        Bridge.withdraw("aehc_perf", testTokenAddress, userAddress, 3e18)
      ).rejects.toThrow("ONLY_OWNER_CALL_ALLOWED");
    });
  });
});
