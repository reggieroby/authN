import { compareSync } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { poolQuery } from "../datastore/accessor";
import { getEmailHash, getPasswordHash } from "../service/crypto";

export async function getUserByEmail(email) {
  return poolQuery(
    `select * from oauthuser WHERE email_hash_wsalt='${getEmailHash(email.toLowerCase())}'`
  )
    .then(({ rows: [user] }) => user);
}
export async function createNewUser(email, password, cell) {
  return poolQuery(
    `INSERT INTO oauthuser
      (email_hash_wsalt,password_hash_wsalt,cell_number,uuid) VALUES
      ($1,$2,$3,$4) RETURNING *
      `,
    [
      getEmailHash(email.toLowerCase()),
      getPasswordHash(password),
      cell,
      uuidv4() + uuidv4(),
    ]
  )
    .then(({ rows: [user] }) => user);
}

export async function getUserWithEmailPassword(email, password) {
  return getUserByEmail(email.toLowerCase())
    .then((user) => user && compareSync(password, user.password_hash_wsalt) ? user : null)
}