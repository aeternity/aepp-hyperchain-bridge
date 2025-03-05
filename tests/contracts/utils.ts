import { AeSdk, MemoryAccount, CompilerHttp, Node } from "@aeternity/aepp-sdk";
import { createContract } from "../../utils/contract";
import { aeTest, hcPerf, hcLocal } from "../../configs/network";

const network = aeTest;

export async function getSdk(accountCount = 1): Promise<AeSdk> {
  const fundingAccount = await network.getFundingAccount();
  const accounts = new Array(accountCount - 1)
    .fill(null)
    .map(() => MemoryAccount.generate());
  accounts.unshift(fundingAccount);

  const sdk = new AeSdk({
    onCompiler: new CompilerHttp(network.compilerUrl),
    nodes: [{ name: "test", instance: new Node(network.url) }],
    accounts,
  });

  for (let i = 0; i < accounts.length; i += 1) {
    await sdk.spend(1e18, accounts[i].address, {
      onAccount: fundingAccount,
      verify: false,
    });
  }

  return sdk;
}

export async function setupContracts(aeSdk: AeSdk) {
  // Contract sources
  const BridgeToken = "contracts/BridgeToken.aes";
  const HyperchainBridge = "contracts/HyperchainBridge.aes";

  // Account addresses
  const ownerAddress: `ak_${string}` = aeSdk.addresses()[0];
  const userAddress: `ak_${string}` = aeSdk.addresses()[1];

  // Deploy contracts
  const TestToken = await createContract(BridgeToken, aeSdk);
  const Bridge = await createContract(HyperchainBridge, aeSdk);

  // Initialize contracts
  await TestToken.init("TestToken", 18, "TST", 100e18);
  await Bridge.init();

  // Contract addresses
  const testTokenAddress = TestToken.$options.address!;
  const bridgeAddress = Bridge.$options.address!;
  const bridgeAccountAddress = bridgeAddress.replace("ct_", "ak_");

  // Setup contracts for testing
  await Bridge.register_network("testnet");
  await Bridge.register_token(testTokenAddress);
  await TestToken.transfer(userAddress, 20e18);

  aeSdk.selectAccount(userAddress);
  await TestToken.create_allowance(bridgeAccountAddress, 100e18);

  return {
    Bridge,
    TestToken,
    ownerAddress,
    userAddress,
    testTokenAddress,
    bridgeAddress,
    bridgeAccountAddress,
  };
}
