import { createClient, type Client, type InStatement, type ResultSet } from "@libsql/client";

let _db: Client | null = null;

function getDb(): Client {
  if (!_db) {
    _db = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    });
  }
  return _db;
}

export const db = {
  execute: (stmt: InStatement): Promise<ResultSet> => getDb().execute(stmt),
  batch: (stmts: InStatement[]): Promise<ResultSet[]> => getDb().batch(stmts),
};
