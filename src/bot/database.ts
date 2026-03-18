import Database from "better-sqlite3";

const db = new Database("bot.db");

db.exec(`CREATE TABLE IF NOT EXISTS cursor (
    id INTEGER PRIMARY KEY CHECK(id = 1),
    seen_at TEXT NOT NULL
);

    CREATE TABLE IF NOT EXISTS processed_posts (
        uri TEXT PRIMARY KEY,
        processed_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    `);

export function getCursor(): string | null {
     const row = db.prepare("SELECT seen_at FROM cursor WHERE id = 1").get() as
          | { seen_at: string }
          | undefined;
     return row?.seen_at ?? null;
}

export function setCursor(seenAt: string): void {
     db.prepare(
          "INSERT OR REPLACE INTO cursor (id, seen_at) VALUES (1, ?)",
     ).run(seenAt);
}

export function hasProcessed(uri: string): boolean {
     const row = db
          .prepare("SELECT 1 FROM processed_posts WHERE uri = ?")
          .get(uri);
     return row !== undefined;
}

export function markProcessed(uri: string): void {
     db.prepare("INSERT OR IGNORE INTO processed_posts (uri) VALUES (?)").run(
          uri,
     );
}
