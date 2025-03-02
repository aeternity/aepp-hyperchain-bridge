import { describe, it, expect } from "bun:test";

import { getSdk, createContract } from "./utils";

describe("Smart Contracts", async () => {
  const aeSdk = await getSdk(2);
  const BridgeToken = "contracts/BridgeToken.aes";
  const HyperchainBridge = "contracts/HyperchainBridge.aes";

  let bridgeAddress: string,
    tokenAddress: string,
    deployerAddress: `ak_${string}` = aeSdk.addresses()[0],
    userAddress: `ak_${string}` = aeSdk.addresses()[1];
  const tokenContract = await createContract(BridgeToken, aeSdk);
  const bridgeContract = await createContract(HyperchainBridge, aeSdk);

  describe("BridgeToken", async () => {
    it("should deploy a new token", async () => {
      await tokenContract.init("TestToken", 18, "TT", 100e18);
      tokenAddress = tokenContract.$options.address!;
      expect(tokenAddress).toBeDefined();
    });

    it("should have a balance of 100", async () => {
      const { decodedResult } = await tokenContract.balance(aeSdk.address);
      expect(decodedResult).toEqual(BigInt(100e18));
    });

    it("should transfer 20 tokens to user address", async () => {
      await tokenContract.transfer(userAddress, 20e18);
      const { decodedResult } = await tokenContract.balance(userAddress);
      expect(decodedResult).toEqual(BigInt(20e18));
    });
  });

  describe("HyperchainBridge", async () => {
    it("should deploy the bridge contract", async () => {
      await bridgeContract.init({}, aeSdk.address);
      bridgeAddress = bridgeContract.$options.address!;
      expect(bridgeContract).toBeDefined();
    });

    it("should register the test token", async () => {
      await bridgeContract.register_token("TT", tokenAddress);
      const { decodedResult } = await bridgeContract.registered_token("TT");
      expect(decodedResult).toBe(tokenAddress);
    });

    it("should deposit 10 tokens to the bridge", async () => {
      const bridgeAccountAddress = bridgeAddress.replace("ct_", "ak_");
      aeSdk.selectAccount(userAddress);

      await tokenContract.create_allowance(bridgeAccountAddress, 10e18);
      await bridgeContract.deposit("TT", 10e18);

      expect(await tokenContract.balance(bridgeAccountAddress)).toHaveProperty(
        "decodedResult",
        BigInt(10e18)
      );
    });

    it("should deposit 1 token to the bridge", async () => {
      const bridgeAccountAddress = bridgeAddress.replace("ct_", "ak_");
      aeSdk.selectAccount(userAddress);

      await tokenContract.change_allowance(bridgeAccountAddress, 1e18);
      await bridgeContract.deposit("TT", 1e18);

      expect(await tokenContract.balance(bridgeAccountAddress)).toHaveProperty(
        "decodedResult",
        BigInt(11e18)
      );
    });

    it("should store deposits", async () => {
      const { decodedResult } = await bridgeContract.deposits();
      const deposit = decodedResult.get(BigInt(0));
      const deposit1 = decodedResult.get(BigInt(1));

      expect(deposit).toHaveProperty("token", tokenAddress);
      expect(deposit).toHaveProperty("amount", BigInt(10e18));
      expect(deposit).toHaveProperty("from", userAddress);

      expect(deposit1).toHaveProperty("token", tokenAddress);
      expect(deposit1).toHaveProperty("amount", BigInt(1e18));
      expect(deposit1).toHaveProperty("from", userAddress);
    });
  });
});
