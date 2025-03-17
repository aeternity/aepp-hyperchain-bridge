import { Database } from "bun:sqlite";
import createSchema from "./schema";

const db = new Database(":memory:");
createSchema(db);

export default db;
