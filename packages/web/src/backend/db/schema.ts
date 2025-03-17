import { Database } from "bun:sqlite";

export default function createSchema(db: Database) {
  db.exec(`
    CREATE TABLE deposits (
      amount TEXT NOT NULL,
      tx_hash TEXT NOT NULL,
      depositor TEXT NOT NULL,
      to_network TEXT NOT NULL,
      from_network TEXT NOT NULL,
      token_address TEXT NOT NULL,
      bridge_address TEXT NOT NULL,
      PRIMARY KEY (from_network, tx_hash),
    )
  `);
}
