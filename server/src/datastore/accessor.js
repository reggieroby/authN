import { Pool } from "pg";
var migrate = require("migrate");
import { runMigrations } from "./migrations";
import applicationConfig from '../config'

let POSTGRES_POOL;
let LOGGER;

const startPool = ({ config = {}, logger = console.error } = {}) => {
  let poolConfig = { ...applicationConfig.get().database.config, ...config }
  LOGGER = logger
  if (!POSTGRES_POOL) {
    POSTGRES_POOL = new Pool(poolConfig);
  }
}

export const poolQuery = async (...params) => {
  let client;
  try {
    client = await POSTGRES_POOL.connect();
    const res = await client.query(...params);
    client.release();
    return res;
  } catch (err) {
    client && client.release();
    LOGGER({ message: err.message, ...err, params });
    console.trace();
    throw "Auth Database Error";
  }
}

export async function initializeDB() {
  return new Promise((resolve, reject) => {
    startPool()
    migrate.load(
      {
        migrationsDirectory: __dirname,
        filterFunction: () => false,
        ignoreMissing: true,
        stateStore: {
          load: async function (fn) {
            try {
              // Load the single row of migration data from the database
              const { rows } = await poolQuery("SELECT data FROM migrations");
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
            await poolQuery(
              "CREATE TABLE IF NOT EXISTS migrations (id integer PRIMARY KEY, data jsonb NOT NULL)"
            );

            await poolQuery(
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
      runMigrations(poolQuery, resolve)
    );
  });
}

export const databaseMiddleware = (req, res, next) => {
  req.authDatabase = { poolQuery }
  next();
};