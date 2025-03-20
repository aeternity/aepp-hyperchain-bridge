import { Database } from "bun:sqlite";

import { BRIDGE_CONTRACTS } from "@aepp-hyperchain-bridge/shared";

export default function initDb() {
  const insertContracts = BRIDGE_CONTRACTS.map(
    (contract) => `
    INSERT OR IGNORE INTO contracts (address, network_id) VALUES ("${contract.address}", "${contract.networkId}");
  `
  ).join("\n");

  const script =`
    -- Create the contracts table
    CREATE TABLE IF NOT EXISTS contracts (
      address VARCHAR(64) PRIMARY KEY,
      network_id VARCHAR(64) NOT NULL,
      last_synced_deposit_id INTEGER,
      last_synced_withdraw_id INTEGER
    );

    -- Insert the bridge contracts
    ${insertContracts}
  
    -- Create the deposits table
    CREATE TABLE IF NOT EXISTS deposits (
      idx INTEGER NOT NULL,
      tx_hash VARCHAR(100) NOT NULL,
      amount VARCHAR(100) NOT NULL,
      from_address VARCHAR(64) NOT NULL,
      token_address VARCHAR(64) NOT NULL,
      for_network_id VARCHAR(64) NOT NULL,
      contract_address VARCHAR(64) NOT NULL,
      PRIMARY KEY (idx, contract_address)
    );
  `
  
    {
      using db = new Database("db.sqlite", { create: true });
      db.exec(script);
      console.log("Database initialized");
    }
}
