import express from "express";
import path from 'path'
import { getUserByEmailPassword } from "../model/user";
import { setNewPar, consumePar, setUserAuthToken, useParWithCode, } from "../model/par";
import { jsonBodyParser } from "./util";

export const Routes = express
  .Router()
  .use(jsonBodyParser)
  .post("/", async (req, res) => {
    const { redirect_uri, client_id, code_challenge, state } = req.body;
    return setNewPar({
      redirect_uri,
      client_id,
      code_challenge,
      state,
    })
      .then(({ request_uri }) => `${req.protocol}://${req.get('host')}${path.resolve(req.baseUrl, '../ui/login')}/${request_uri}`)
      .then(loginURL => ({ status: true, loginURL }))
      .catch(() => ({ status: false, }))
      .then((payload) => res.send(payload))
  })
  .post("/getAuthCode", async (req, res) => {
    const { email, password, request_uri } = req.body;

    return getUserByEmailPassword(email, password)
      .then((user) => {
        if (!user) {
          throw new Error('Incorrect credentials.')
        }
        return { user, request_uri }
      })
      .then(consumePar)
      .then(({ code, state, redirect_uri }) => {
        if (!(code && state)) {
          throw new Error('Bad Par.')
        }
        return { status: true, code, state, redirect_uri };
      })
      .catch((err) => ({ status: false, }))
      .then((payload) => res.send(payload))
  })
  .post("/getAuthToken", async (req, res) => {
    const { code, code_verifier } = req.body;
    return useParWithCode(code, code_verifier)
      .then((par) => {
        if (!par) {
          throw new Error('Incorrect code/code verifier combination.')
        }
        return { par }
      })
      .then(setUserAuthToken)
      .then(({ token, refresh_token: refreshToken }) => {
        if (!token) {
          throw new Error('Failed to set token.')
        }
        return { status: true, token, refreshToken };
      })
      .catch((err) => {
        console.error(err)
        return ({ status: false, })
      })
      .then((payload) => res.send(payload))
  })