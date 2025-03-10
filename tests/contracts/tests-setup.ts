import { AeSdk } from "@aeternity/aepp-sdk";
import ContractWithMethods, {
  ContractMethodsBase,
} from "@aeternity/aepp-sdk/es/contract/Contract";

import { createOrUseExistingContracts } from "@/utils/contract";

export async function testsSetup(aeSdk: AeSdk) {
  // Account addresses
  const ownerAddress: `ak_${string}` = aeSdk.addresses()[0];
  const userAddress: `ak_${string}` = aeSdk.addresses()[1];

  // Load or create contracts
  const { Bridge, TestToken } = await createOrUseExistingContracts(aeSdk);

  // Contract addresses
  const testTokenAddress = TestToken.$options.address!;
  const bridgeAddress = Bridge.$options.address!;
  const bridgeAccountAddress = bridgeAddress.replace("ct_", "ak_");

  await configureContractsForTesting(
    Bridge,
    TestToken,
    bridgeAccountAddress,
    testTokenAddress,
    userAddress,
    ownerAddress,
    aeSdk
  );

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

async function configureContractsForTesting(
  Bridge: ContractWithMethods<ContractMethodsBase>,
  TestToken: ContractWithMethods<ContractMethodsBase>,
  bridgeAccountAddress: string,
  testTokenAddress: string,
  userAddress: string,
  ownerAddress: string,
  aeSdk: AeSdk
) {
  // Register testnet network
  aeSdk.selectAccount(ownerAddress as `ak_${string}`);
  const { decodedResult: registeredNetworks } =
    await Bridge.registered_networks();
  if (!registeredNetworks.includes("testnet")) {
    await Bridge.register_network("testnet");
  }

  // Register test token
  const { decodedResult: registeredTokens } = await Bridge.registered_tokens();
  if (!registeredTokens.includes(testTokenAddress)) {
    await Bridge.register_token(testTokenAddress);
  }

  // Transfer test tokens to user
  const { decodedResult: userTestTokenBalance } = await TestToken.balance(
    userAddress
  );
  if (!userTestTokenBalance || userTestTokenBalance === BigInt(0)) {
    await TestToken.transfer(userAddress, 1e24);
  }

  // Create allowance for bridge account
  aeSdk.selectAccount(userAddress as `ak_${string}`);
  const { decodedResult: allowance } = await TestToken.allowance({
    from_account: userAddress,
    for_account: bridgeAccountAddress,
  });
  if (!allowance || allowance === BigInt(0)) {
    await TestToken.create_allowance(bridgeAccountAddress, 1e27);
  }
}
