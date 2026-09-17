import postgres from "postgres";

import { Network } from "@/types/network";
import { BridgeAction } from "@/types/bridge";
import { TablesInsert } from "./database.types";

const sql = postgres({
  host: Bun.env.PG_HOST!,
  port: Number(Bun.env.PG_PORT ?? 5432),
  database: Bun.env.PG_DATABASE!,
  username: Bun.env.PG_USER!,
  password: Bun.env.PG_PASSWORD!,
  ssl: Bun.env.PG_SSL === "true" ? "require" : false,
});

export default sql;

// Idempotent so it's safe to run on every startup, no separate migration step needed.
export async function ensureSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS networks (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      "mdwUrl" TEXT NOT NULL UNIQUE,
      "mdwWebSocketUrl" TEXT NOT NULL UNIQUE,
      "explorerUrl" TEXT NOT NULL UNIQUE,
      "bridgeContractAddress" TEXT NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS actions (
      "sourceNetworkId" TEXT NOT NULL,
      "targetNetworkId" TEXT NOT NULL,
      "entryIdx" BIGINT NOT NULL,
      "entryTxHash" TEXT NOT NULL,
      "entryTimestamp" NUMERIC NOT NULL,
      "userAddress" TEXT NOT NULL,
      amount NUMERIC NOT NULL,
      "tokenAddress" TEXT,
      "tokenName" TEXT NOT NULL,
      "tokenSymbol" TEXT NOT NULL,
      "tokenDecimals" SMALLINT NOT NULL,
      "bridgeEntryData" JSON NOT NULL,
      "exitTxHash" TEXT,
      "exitTimestamp" NUMERIC,
      "exitRequestData" JSON,
      "isCompleted" BOOLEAN NOT NULL DEFAULT false,
      PRIMARY KEY ("sourceNetworkId", "entryIdx")
    )
  `;
}

function toActionRow(a: TablesInsert<"actions">) {
  return {
    sourceNetworkId: a.sourceNetworkId,
    targetNetworkId: a.targetNetworkId,
    entryIdx: a.entryIdx,
    entryTxHash: a.entryTxHash,
    entryTimestamp: a.entryTimestamp,
    userAddress: a.userAddress,
    amount: a.amount,
    tokenAddress: a.tokenAddress ?? null,
    tokenName: a.tokenName,
    tokenSymbol: a.tokenSymbol,
    tokenDecimals: a.tokenDecimals,
    bridgeEntryData: sql.json(a.bridgeEntryData as any),
    isCompleted: a.isCompleted ?? false,
  };
}

export async function upsertActions(
  actions: TablesInsert<"actions">[]
): Promise<BridgeAction[]> {
  if (actions.length === 0) return [];

  return sql<BridgeAction[]>`
    INSERT INTO actions ${sql(actions.map(toActionRow))}
    ON CONFLICT ("sourceNetworkId", "entryIdx") DO UPDATE SET
      "targetNetworkId" = EXCLUDED."targetNetworkId",
      "entryTxHash" = EXCLUDED."entryTxHash",
      "entryTimestamp" = EXCLUDED."entryTimestamp",
      "userAddress" = EXCLUDED."userAddress",
      amount = EXCLUDED.amount,
      "tokenAddress" = EXCLUDED."tokenAddress",
      "tokenName" = EXCLUDED."tokenName",
      "tokenSymbol" = EXCLUDED."tokenSymbol",
      "tokenDecimals" = EXCLUDED."tokenDecimals",
      "bridgeEntryData" = EXCLUDED."bridgeEntryData"
    RETURNING *
  `;
}

export async function updateActionExit(params: {
  sourceNetworkId: string;
  entryIdx: number;
  exitTimestamp: number;
  exitTxHash: string;
  exitRequestData: string;
}): Promise<BridgeAction | null> {
  const [row] = await sql<BridgeAction[]>`
    UPDATE actions SET
      "exitTimestamp" = ${params.exitTimestamp},
      "exitTxHash" = ${params.exitTxHash},
      "exitRequestData" = ${sql.json(params.exitRequestData as any)},
      "isCompleted" = true
    WHERE "sourceNetworkId" = ${params.sourceNetworkId}
      AND "entryIdx" = ${params.entryIdx}
    RETURNING *
  `;
  return row ?? null;
}

export async function getNetworks(): Promise<Network[]> {
  return sql<Network[]>`SELECT * FROM networks`;
}

export async function insertNetwork(network: Network): Promise<Network> {
  const [row] = await sql<Network[]>`
    INSERT INTO networks ${sql(network)}
    RETURNING *
  `;
  return row;
}

export async function findConflictingNetwork(
  network: Network
): Promise<Network | null> {
  const [row] = await sql<Network[]>`
    SELECT * FROM networks
    WHERE id = ${network.id}
       OR url = ${network.url}
       OR "mdwUrl" = ${network.mdwUrl}
       OR "mdwWebSocketUrl" = ${network.mdwWebSocketUrl}
    LIMIT 1
  `;
  return row ?? null;
}

export async function getLastAction(
  networkId: string
): Promise<BridgeAction | null> {
  const [row] = await sql<BridgeAction[]>`
    SELECT * FROM actions
    WHERE "sourceNetworkId" = ${networkId}
    ORDER BY "entryIdx" DESC
    LIMIT 1
  `;
  return row ?? null;
}

export async function getActionsByUser(
  userAddress: string
): Promise<BridgeAction[]> {
  return sql<BridgeAction[]>`
    SELECT * FROM actions
    WHERE "userAddress" = ${userAddress}
    ORDER BY "isCompleted" ASC, "entryTimestamp" DESC
  `;
}

export async function getActionByNetworkAndIdx(
  sourceNetworkId: string,
  entryIdx: number
): Promise<BridgeAction[]> {
  return sql<BridgeAction[]>`
    SELECT * FROM actions
    WHERE "sourceNetworkId" = ${sourceNetworkId}
      AND "entryIdx" = ${entryIdx}
  `;
}
