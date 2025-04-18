# Hyperchain Bridge

The Hyperchain Bridge enables seamless token transfers between the Aeternity blockchain and its Hyperchains. It ensures secure and efficient scalability and interoperability across these networks. By monitoring Aeternity networks, it indexes and stores bridge transactions, facilitating fast data retrieval for the user interface. Additionally, the application empowers users to integrate new Hyperchain networks, extending bridge capabilities to emerging networks.

## Getting Started

### Prerequisites

1. **Install Bun.js:**  
   The bridge application uses Bun.js as its JavaScript runtime. Install Bun.js on the machine that will run the application: [Bun.js Installation Guide](https://bun.sh/docs/installation).

2. **Setup Supabase:**  
   The bridge application relies on a PostgreSQL database hosted on the Supabase platform. The database should include the following tables: `actions` and `networks`. Use the SQL definitions below to create the tables:

   <details>
   <summary>SQL Definitions</summary>

   ```sql
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

   After setting up the database:

   - Obtain `SUPABASE_URL` and `SUPABASE_ANON_KEY` from the Supabase dashboard and add them to the `.env` file.
   - Disable Row Level Security (RLS) for these tables.

3. **Add Bridge Operator Private Key:**  
   Add a trusted account's private key to the `.env` file under the `BRIDGE_OWNER_PK` variable.  
   **Note:** Private keys must be in the old format (128 characters long, base64 string).

4. **Add Networks:**  
   Add your Hyperchain networks to `src/constants/networks.ts` with the appropriate settings (leave bridge contract addresses empty and fill them once deploy step is done)

5. **Deploy Bridge Contracts:**  
   Deploy the HyperchainBridge contracts for each network using deploy scripts:

   ```bash
   bun deploy-bridge --network $NETWORK_ID
   ```

   Note: Before running the deploy command, make sure corresponding network has been added to `src/constants/networks.ts` and `BRIDGE_OWNER_PK` environment variable is set.

### Application Checklist

Before running the application, ensure the following steps are completed:

1. Add the required environment variables to a `.env` file:

   ```env
   # Bridge operator account's private key
   BRIDGE_OWNER_PK=

   # Bridge user account's private key (for testing purposes)
   BRIDGE_USER_PK=

   # Supabase URL and Anonymous key from the Supabase dashboard
   SUPABASE_URL=
   SUPABASE_ANON_KEY=
   ```

2. Update the network constants in `src/constants/networks.ts` with the deployed bridge contract addresses using the bridge operator account.

3. Ensure the Hyperchain networks are added to the constants with valid attributes. By default, only Mainnet and Testnet networks are included. Additional chains can be specified in this file or added through the network identification flow.

### Running the Application

1. **Install Dependencies:**

   ```bash
   bun install
   ```

2. **Run the Development Build:**  
   Start the development build with hot module replacement:

   ```bash
   bun dev
   ```

3. **Run the Production Build:**  
   Start the production build:

   ```bash
   bun start
   ```

### Debugging

The application can be debugged using Visual Studio Code with the `Bun for Visual Studio Code` extension. After installing the extension, use the debug configurations in `launch.json` to debug the application.

## Architecture and Workflow

### Tech Stack

The Hyperchain Bridge leverages the following technologies:

- **TypeScript:** Ensures type safety and improves developer productivity.
- **Bun.js:** A JavaScript runtime powering backend services for efficient handling of bridge transactions, data processing, and routing.
- **React:** Provides a responsive and user-friendly interface.
- **Sophia:** A functional smart contract language for secure and efficient contracts on the Aeternity blockchain.
- **Supabase:** An open-source Firebase alternative for managing PostgreSQL databases.
- **Docker:** Simplifies deployment and management by containerizing components for consistency across environments.
- **aepp-js-sdk:** A JavaScript SDK for interacting with the Aeternity blockchain.
- **Aeternity Middleware:** Indexes and provides access to blockchain data for efficient querying and retrieval.

### Components

The project consists of the following key components:

- **Smart Contracts:** Includes HyperchainBridge and AEX9 FungibleToken Sophia contracts for secure transactions, along with unit tests for critical functionality.
- **Deployment Scripts:** Utility scripts for streamlined deployment of smart contracts.
- **Backend:** Listens for new bridge transactions and stores them in a PostgreSQL database.
- **Frontend:** Enables users to interact with the bridge contracts, perform bridge actions, view transaction history, and monitor ongoing transactions.

### Bridge Workflow

The bridge workflow involves transferring tokens between Aeternity blockchains using the HyperchainBridge contract:

1. A user initiates a bridge action by calling the `enter_bridge` function on the HyperchainBridge contract with the destination network, token, amount, and other parameters.
2. After the entry transaction is confirmed, the user connects to the destination network specified in the call.
3. The user retrieves the necessary parameters (e.g., signature, timestamp) from the bridge API backend.
4. On the destination network, the user calls the `exit_bridge` function with the retrieved parameters.
5. The bridge contract verifies the request and completes the bridge action.

### Network Identification Workflow

The application allows users to add new networks by providing details such as `nodeURL` and `mdwURL`. The workflow is as follows:

1. Connect to a network not specified in the `networks` constants.
2. Fill out the form with the required network details and submit.
3. The application verifies the network's connectivity and provides feedback.
4. Fund the bridge operator's account for contract deployment.
5. Complete the process by clicking the "Finish" button after funding the account.
