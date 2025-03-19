import { Database } from "bun:sqlite";
import { ContractRow } from "./models";


export const getContractRow = (
  contractAddress: string,
  networkId: string
) => {
  {
    using db = new Database("db.sqlite", { create: true });
    using query = db
    .query(
      `SELECT * 
          FROM contracts 
          WHERE address = $contractAddress AND network_id = $networkId`
    ).as(ContractRow);

    return query.get({ $contractAddress: contractAddress, $networkId: networkId });
  }
};

export const insertDeposits = (networkId: string, address: string, values: {
  amount: BigInt;
  from: string;
  token: string;
  index: BigInt;
  for_network: string;
}[]) => {
  if (values.length === 0) return;

  {
    using db = new Database("db.sqlite", { create: true });
    using insertDepositStmt = db.prepare(
      `INSERT INTO deposits (idx, contract_address, amount, from_address, token_address, for_network_id)
          VALUES ($index, $contractAddress, $amount, $from, $token, $for_network)`
    )
    using updateContractStmt = db.prepare(
      `UPDATE contracts 
          SET last_synced_deposit_id = $lastSyncedDepositId
          WHERE address = $contractAddress AND network_id = $networkId`
    )

    const inserts = db.transaction(values => {
      for (const value of values) {
        insertDepositStmt.run({
          $index: value.index.toString(),
          $contractAddress: address,
          $amount: value.amount.toString(),
          $from: value.from,
          $token: value.token,
          $for_network: value.for_network,
        });
      }

      updateContractStmt.run({
        $lastSyncedDepositId: values[values.length - 1].index.toString(),
        $contractAddress: address,
        $networkId: networkId,
      })
    })
    
    inserts(values);
    db.close();

    console.log("Inserted deposit", values);
  }
};
