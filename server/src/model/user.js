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

export async function getUserByEmailPassword(email, password) {
  return getUserByEmail(email.toLowerCase())
    .then((user) => user && compareSync(password, user.password_hash_wsalt) ? user : null)
}

export async function getUserByAuthToken(token) {
  return poolQuery(`SELECT * FROM oauthuser WHERE token = '${token}'`)
    .then(({ rows: [user] }) => user);
}






// import { genSaltSync, hashSync, compareSync } from "bcryptjs";
// import crypto from "crypto";
// import { v4 as uuidv4 } from "uuid";
// import jwt from "jsonwebtoken";
// import { customAlphabet } from "nanoid";
// import { sendSMS } from './service/sms';
// import { poolQuery } from "./datastore/accessor";
// import { getEmailHash, getPasswordHash } from "./service/crypto";

  // async function getUserWithAuthRefreshToken(refreshToken) {
  //   const {
  //     rows: [user],
  //   } = await dbQuery(
  //     `SELECT * FROM oauthuser WHERE refresh_token = '${refreshToken}'`
  //   );
  //   return user;
  // }


  // async function setUserAuthMFACode(authCode) {
  //   const mfa_code = customAlphabet("1234567890", 6)();
  //   const {
  //     rows: [user],
  //   } = await dbQuery(
  //     `UPDATE oauthuser SET mfa_code = '${mfa_code}' WHERE code = '${authCode}' RETURNING *`
  //   );
  //   sendSMS(
  //     user.cell_number,
  //     `${mfa_code} is your ${name} authentication code\n@${website} #${mfa_code}`
  //   );
  //   return user;
  // }

  // async function setUserAuthRefreshToken(refreshToken) {
  //   const {
  //     rows: [user],
  //   } = await dbQuery(
  //     `UPDATE oauthuser SET token = '${uuidv4() + uuidv4()
  //     }', refresh_token = '${uuidv4() + uuidv4()
  //     }' WHERE refresh_token = '${refreshToken}' RETURNING *`
  //   );
  //   return user;
  // }
  // async function verifyUserAuthMFACode(authCode, mfaCode) {
  //   const {
  //     rows: [user],
  //   } = await dbQuery(
  //     `UPDATE oauthuser SET mfa_code = '', mfa_verified = true WHERE code = '${authCode}' AND mfa_code = '${mfaCode}' RETURNING *`
  //   );
  //   return user;
  // }
