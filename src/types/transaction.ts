export interface Transaction {
  hash: string;
  tx: {
    arguments: Array<{ type: string; value: string }>;
    caller_id: string;
    result: "ok" | "error";
    return: {
      type: string;
      value: number;
    };
  };
  micro_time: number;
}

export interface TransactionsResult {
  data: Transaction[];
  next: string | null;
  prev: string | null;
}
