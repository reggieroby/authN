import { Pool } from "pg";
var migrate = require("migrate");


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