import { Pool } from "pg";
var migrate = require("migrate");
import { runMigrations } from "./migrations";

export async function initializeDB({ dbQuery }) {
  return new Promise((resolve, reject) => {
    migrate.load(
      {
        migrationsDirectory: __dirname,
        filterFunction: () => false,
        ignoreMissing: true,
        stateStore: {
          load: async function (fn) {
            try {
              // Load the single row of migration data from the database
              const { rows } = await dbQuery("SELECT data FROM migrations");
              fn(null, rows[0].data);
            } catch (err) {
              console.log(
                "Cannot read migrations from database. If this is the first time you run migrations, then this is normal."
              );
              fn(null, {});
            }
          },

          save: async function (set, fn) {
            // Check if table 'migrations' exists and if not, create it.
            await dbQuery(
              "CREATE TABLE IF NOT EXISTS migrations (id integer PRIMARY KEY, data jsonb NOT NULL)"
            );

            await dbQuery(
              `
                INSERT INTO migrations (id, data)
                VALUES (1, $1)
                ON CONFLICT (id) DO UPDATE SET data = $1
              `,
              [
                {
                  lastRun: set.lastRun,
                  migrations: set.migrations,
                },
              ]
            );

            fn();
          },
        },
      },
      runMigrations(dbQuery, resolve)
    );
  });
}

export async function DB(config) {
  const pool = new Pool(config);
  return async (...params) => {
    try {
      return await pool.query(...params);
    } catch (err) {
      console.error(err);
    }
    throw new Error("");
  };
}
