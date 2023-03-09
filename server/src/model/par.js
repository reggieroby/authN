import { customAlphabet } from "nanoid";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { poolQuery } from "../datastore/accessor";
import { encodeData, hexDigest, sha512Hash } from "../service/crypto";
import applicationConfig from '../config'

export async function setNewPar({ redirect_uri, client_id, code_challenge, state }) {
  return poolQuery(
    `INSERT INTO oauthpar
      (request_uri,redirect_uri,client_id,code_challenge,state) VALUES
      ($1,$2,$3,$4,$5) RETURNING *
      `,
    [
      customAlphabet(
        "1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM",
        512
      )(),
      redirect_uri,
      client_id,
      code_challenge,
      state
    ]
  )
    .then(({ rows: [par] }) => par);
}
export async function consumePar({ user, request_uri }) {
  return poolQuery(
    `UPDATE oauthpar SET request_uri = '', code = $1 WHERE request_uri = $2 RETURNING *`,
    [
      customAlphabet(
        "1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM",
        512
      )(),
      request_uri
    ]
  )
    .then(({ rows: [par] }) => par)
    .then((par) =>
      poolQuery(
        `UPDATE oauthuser SET par_id = '${par.id}' WHERE id='${user.id}'`
      )
        .then(() => par)
    )
}
export async function useParWithCode(code, code_verifier) {
  return sha512Hash(encodeData(code_verifier))
    .then(hexDigest)
    .then((computedCC) => poolQuery(
      `DELETE FROM oauthpar WHERE code = '${code}' AND code_challenge='${computedCC}' RETURNING *`
    ))
    .then(({ rows: [par] }) => par);
}
export async function setUserAuthToken({ par }) {
  return poolQuery(`SELECT * FROM oauthuser WHERE par_id = '${par.id}'`)
    .then(({ rows: [user] }) => user)
    .then((user) => {
      let time = new Date();
      time.setMinutes(time.getMinutes() + 1);
      return jwt.sign(
        {
          iss: "ca.auth",
          sub: user.uuid,
          aud: "ca.apps",
          exp: time.getTime(),
          iat: Date.now(),
        },
        applicationConfig.get().tokenSigningKey
      );
    })
    .then((token) => poolQuery(
      `UPDATE oauthuser SET token = '${token}', refresh_token = '${uuidv4() + uuidv4()
      }' WHERE par_id = '${par.id}' RETURNING *`
    ))
    .then(({ rows: [user] }) => user)
}