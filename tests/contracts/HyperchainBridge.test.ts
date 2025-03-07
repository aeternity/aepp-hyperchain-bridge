import { describe, expect, test, beforeEach, beforeAll } from "bun:test";

import { getSdk, setupContracts } from "./utils";

describe("HyperchainBridge", async () => {
  const aeSdk = await getSdk();
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

      await Bridge.deposit("testnet", testTokenAddress, 10e18);

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
        for_network: "testnet",
        token: testTokenAddress,
      });
    });

    test("user should not be able to deposit if the specified token is not registered", async () => {
      await expect(
        Bridge.deposit("testnet", bridgeAddress, 10e18)
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
      await Bridge.deposit("testnet", testTokenAddress, 3e18);
    });

    test("owner should be able to withdraw tokens from the bridge", async () => {
      const { decodedResult: userBalanceBefore } = await TestToken.balance(
        userAddress
      );

      aeSdk.selectAccount(ownerAddress);
      await Bridge.withdraw("testnet", testTokenAddress, userAddress, 3e18);

      const { decodedResult: withdraws } = await Bridge.withdraws();
      const { decodedResult: userBalanceAfterWithdraw } =
        await TestToken.balance(userAddress);

      expect(userBalanceAfterWithdraw).toBe(userBalanceBefore + BigInt(3e18));
      expect(withdraws[withdraws.length - 1]).toEqual({
        recipient: userAddress,
        amount: BigInt(3e18),
        from_network: "testnet",
        token: testTokenAddress,
      });
    });

    test("user without owner privileges should not be able to withdraw tokens from the bridge", async () => {
      aeSdk.selectAccount(userAddress);
      await expect(
        Bridge.withdraw("testnet", testTokenAddress, userAddress, 3e18)
      ).rejects.toThrow("ONLY_OWNER_CALL_ALLOWED");
    });
  });
});
