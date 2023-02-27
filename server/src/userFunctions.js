import bcrypt from "bcryptjs";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { customAlphabet } from "nanoid";

const { genSaltSync, hashSync, compareSync } = bcrypt;

export function userFunctions({
  dbQuery,
  emailSalt,
  client: { name, website },
  sendSMS,
  tokenSigningKey,
}) {
  const getPasswordHash = (password) => hashSync(password, genSaltSync(10));
  const getEmailHash = (email) =>
    emailSalt ? hashSync(email, emailSalt) : email;

  async function getUserWithEmail(email) {
    const {
      rows: [user],
    } = await dbQuery(
      `select * from oauthuser WHERE email_hash_wsalt='${getEmailHash(email.toLowerCase())}'`
    );
    return user;
  }
  async function getUserWithAuthToken(token) {
    const {
      rows: [user],
    } = await dbQuery(`SELECT * FROM oauthuser WHERE token = '${token}'`);
    return user;
  }
  async function getUserWithAuthRefreshToken(refreshToken) {
    const {
      rows: [user],
    } = await dbQuery(
      `SELECT * FROM oauthuser WHERE refresh_token = '${refreshToken}'`
    );
    return user;
  }
  async function getUserWithEmailPassword(email, password) {
    let user = null;
    const userWithEmail = await getUserWithEmail(email.toLowerCase());
    if (
      userWithEmail &&
      compareSync(password, userWithEmail.password_hash_wsalt)
    ) {
      user = userWithEmail;
    }
    return user;
  }
  async function setNewUser(email, password, cell) {
    const {
      rows: [user],
    } = await dbQuery(
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
    );
    return user;
  }
  async function setUserAuthMFACode(authCode) {
    const mfa_code = customAlphabet("1234567890", 6)();
    const {
      rows: [user],
    } = await dbQuery(
      `UPDATE oauthuser SET mfa_code = '${mfa_code}' WHERE code = '${authCode}' RETURNING *`
    );
    sendSMS(
      user.cell_number,
      `${mfa_code} is your ${name} authentication code\n@${website} #${mfa_code}`
    );
    return user;
  }
  async function setUserAuthToken(parID) {
    const {
      rows: [parUser],
    } = await dbQuery(`SELECT * FROM oauthuser WHERE par_id = '${parID}'`);
    let time = new Date();
    time.setMinutes(time.getMinutes() + 1);
    const token = jwt.sign(
      {
        iss: "ca.oauth",
        sub: parUser.uuid,
        aud: "ca.apps",
        exp: time.getTime(),
        iat: Date.now(),
      },
      tokenSigningKey
    );
    const {
      rows: [user],
    } = await dbQuery(
      `UPDATE oauthuser SET token = '${token}', refresh_token = '${uuidv4() + uuidv4()
      }' WHERE par_id = '${parID}' RETURNING *`
    );
    return user;
  }
  async function setUserAuthRefreshToken(refreshToken) {
    const {
      rows: [user],
    } = await dbQuery(
      `UPDATE oauthuser SET token = '${uuidv4() + uuidv4()
      }', refresh_token = '${uuidv4() + uuidv4()
      }' WHERE refresh_token = '${refreshToken}' RETURNING *`
    );
    return user;
  }
  async function verifyUserAuthMFACode(authCode, mfaCode) {
    const {
      rows: [user],
    } = await dbQuery(
      `UPDATE oauthuser SET mfa_code = '', mfa_verified = true WHERE code = '${authCode}' AND mfa_code = '${mfaCode}' RETURNING *`
    );
    return user;
  }
  async function setNewPar({ redirect_uri, client_id, code_challenge, state }) {
    const request_uri = customAlphabet(
      "1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM",
      512
    )();
    const {
      rows: [par],
    } = await dbQuery(
      `INSERT INTO oauthpar
      (request_uri,redirect_uri,client_id,code_challenge,state) VALUES
      ($1,$2,$3,$4,$5) RETURNING *
      `,
      [request_uri, redirect_uri, client_id, code_challenge, state]
    );
    return par;
  }
  async function attachUsersPar(userID, parID) {
    await dbQuery(
      `UPDATE oauthuser SET par_id = '${parID}' WHERE id='${userID}'`
    );
    const code = customAlphabet(
      "1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM",
      512
    )();
    const {
      rows: [par],
    } = await dbQuery(
      `UPDATE oauthpar SET code = '${code}' WHERE id = '${parID}' RETURNING *`
    );
    return par;
  }
  async function usePar(request_uri) {
    const {
      rows: [par],
    } = await dbQuery(
      `UPDATE oauthpar SET request_uri = '' WHERE request_uri = '${request_uri}' RETURNING *`
    );
    return par;
  }
  async function useParWithCode(code, code_verifier) {
    const computedCC = crypto
      .createHash("sha256")
      .update(code_verifier)
      .digest("hex");

    const {
      rows: [par],
    } = await dbQuery(
      `DELETE FROM oauthpar WHERE code = '${code}' AND code_challenge='${computedCC}' RETURNING *`
    );

    return par;
  }
  return {
    getUserWithAuthToken,
    getUserWithAuthRefreshToken,
    getUserWithEmail,
    getUserWithEmailPassword,

    setNewUser,
    setUserAuthToken,
    setUserAuthRefreshToken,
    setUserAuthMFACode,

    setNewPar,
    usePar,
    attachUsersPar,
    useParWithCode,

    verifyUserAuthMFACode,
  };
}
