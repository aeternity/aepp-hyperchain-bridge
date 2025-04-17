# Hyperchain Bridge

The Hyperchain Bridge facilitates seamless token transfers between the Aeternity blockchain and its hyperchains. It provides a secure and efficient mechanism to enhance scalability and interoperability across these networks. Additionally, it monitors the Aeternity networks to store and index bridge transactions, enabling fast data retrieval for the user interface. It also provides functionality for users to add new Hyperchain networks.

## Getting started

### Prerequisites

- **Install Bun.js:** Bridge application uses the Bun.js as JS runtime so, bun should be installed on the machine that will run the application: https://bun.sh/docs/installation

- **Setup Supabase:** Bridge application relies on a postgresql database that runs on supabase platform. The database should have `actions` and `networks` tables with schemas below:
  <details>
  <summary>SQL Definitions</summary>

  ```
  create table public.actions (
    "sourceNetworkId" text not null,
    "entryIdx" bigint not null,
    "userAddress" text not null,
    "targetNetworkId" text not null,
    "tokenAddress" text null,
    "tokenName" text not null,
    "tokenSymbol" text not null,
    "tokenDecimals" smallint not null,
    amount numeric not null,
    "bridgeEntryData" json not null,
    "isCompleted" boolean not null default false,
    "exitRequestData" json null,
    "entryTxHash" text not null,
    "exitTxHash" text null,
    "entryTimestamp" numeric not null,
    "exitTimestamp" numeric null,
    constraint actions_pkey primary key ("sourceNetworkId", "entryIdx")
  ) TABLESPACE pg_default;

  create table public.networks (
    id text not null,
    url text not null,
    name text not null,
    "mdwUrl" text not null,
    "explorerUrl" text not null,
    "bridgeContractAddress" text not null,
    "mdwWebSocketUrl" text not null,
    constraint networks_pkey primary key (id),
    constraint networks_explorerUrl_key unique ("explorerUrl"),
    constraint networks_mdwUrl_key unique ("mdwUrl"),
    constraint networks_mdwWebSocketUrl_key unique ("mdwWebSocketUrl"),
    constraint networks_url_key unique (url)
  ) TABLESPACE pg_default;

  ```

  </details>

  After setup completed; `SUPABASE_URL` and `SUPABASE_ANON_KEY` should be obtained from the supabase platform and set in the `.env` file.

  Note: Row Level Security (RLS) should be disabled for these tables.

- **Add Bridge Operator Private key:** Place a trusted account's private key to `.env` file under `BRIDGE_OWNER_PK` name.

  Note: Private keys should be in old format, 128 chars long and base64 string.

- **Deploy Bridge contracts:** HyperchainBridge contracts should be deployed for each network by the trusted bridge operator account.

- **Add Networks**: Add your Hyperchain networks to the `src/constants/networks.ts` with the proper settings and bridge contract address.

### Application checklist

1. Before running the application, following environment variables must be added to a `.env` file:

   ```
   # Bridge operator account's private key
   BRIDGE_OWNER_PK=

   # Bridge user account's private key (using for testing)
   BRIDGE_USER_PK=

   # Supabase URL and Anonymous key from supabase dashboard
   SUPABASE_URL=
   SUPABASE_ANON_KEY=
   ```

2. Make sure that network constants(`src/constants/networks.ts`) are updated with bridge contract addresses deployed with bridge operator account.

3. The Hyperchain networks are added to constants with valid attributes. Currently, there are only Mainnet and, Testnet networks added as defaults. More chains can be specified in this file or going through network identification flow.

### Run the application

Install dependencies:

```
bun install
```

Run the dev build with hot module replacement:

```
bun dev
```

Start a production build:

```
bun start
```

### Debugging

Application can easily be debugged with VS Code utilizing `Bun for Visual Studio Code` extension. After extension installed, debug configurations in `launch.json` can be executed.

## Architecture and Workflow

### Tech Stack

The Hyperchain Bridge leverages the following technologies:

- **TypeScript:** Provides type safety and improved developer productivity across the codebase.
- **Bun.js:** A JavaScript runtime that powers the backend services, enabling efficient handling of bridge transactions, data processing, and routing.
- **React:** A JavaScript library for building the user interface, ensuring a responsive and user-friendly experience.
- **Sophia:** A functional smart contract language used for writing secure and efficient contracts on the Aeternity blockchain.
- **Supabase:** An open-source Firebase alternative for managing PostgreSQL databases.
- **Docker:** Simplifies the deployment and management of the application by containerizing its components, ensuring consistency across environments.
- **aepp-js-sdk:** A JavaScript SDK for interacting with the Aeternity blockchain, enabling seamless integration and communication with blockchain nodes.
- **Aeternity Middleware:** A service that indexes and provides access to blockchain data, enabling efficient querying and retrieval of transaction and contract information.

### Components

The project consists of the following key components that form the Hyperchain Bridge Application:

- **Smart Contracts:** HyperchainBridge and AEX9 FungibleToken Sophia contracts to ensure secure and trusted transactions. In addition, unit tests to cover critical bridge functionality.
- **Deployment Scripts:** Utility scripts designed to simplify the deployment of smart contracts, ensuring a streamlined and efficient setup process.
- **Backend:** The backend of the bridge application is designed to deliver essential data for seamless bridge operations. It listens for new bridge transactions and stores them in a PostgreSQL database.
- **Frontend:** The bridge's user interface enables users to interact with the bridge contracts, perform bridge actions, view the bridge history, and monitor ongoing bridge transactions.

### Bridge Workflow

**Bridge action** is means that depositing tokens to an Aeternity blockchain using HyperchainBridge contract and then claiming the deposited tokens counterpart on another Aeternity blockchain.

1. A bridge action starts with a user calling the `enter_bridge` function on a HyperchainBridge smart contract with proper parameters to specify the destination network, token, amount, etc.
2. Once the entry transaction is confirmed and processed by the blockchain, the user connects to the destination network specified in the enter call.
3. The user calls the bridge API backend to retrieve the necessary parameters for completing the bridge action, including a signature and a timestamp.
4. On the destination network, the user calls the `exit_bridge` function with parameters obtained from the API backend's signature endpoint.
5. The bridge contract verifies the bridge exit request parameters with the signature and timestamp, then completes the bridge action accordingly.

### Identify Network Workflow

The application includes a feature that allows users to add new networks by providing details such as nodeURL and mdwURL, verifying the network's connectivity, automatically deploying the bridge contract, and storing the network entity in the database.

1. Go to bridge application and connect to a network that is not specified in the `networks` constants.

2. Application will display a form asking required information to connect to network's node. Fill the form and submit.

3. Afterwards, application will check the given network's connectivity and then gives feedback about result.

4. On the next step, application will display the bridge operator's account address for user to fund the account for bridge contract deployment.

5. After enough funds sent to operator address, click finish button to complete the flow.
