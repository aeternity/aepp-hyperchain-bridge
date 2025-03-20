export class ContractRow {
  address: string;
  network_id: string;
  last_synced_deposit_id?: number;
  last_synced_withdraw_id?: number;
}

export class DepositRow {
  idx: number;
  contract_address: string;
  amount: string;
  from_address: string;
  token_address: string;
  for_network_id: string;
  tx_hash: string;
}
