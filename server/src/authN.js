import express from "express";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import Identicon from "identicon.js";
import path from 'path';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authZ } from "./authZ";
import { databaseMiddleware, poolQuery } from "./datastore/accessor";
import { serveSPA } from '@codealpha/serve-spa'
import { getUserByEmail, createNewUser, getUserWithEmailPassword } from "./model/user";
import { setNewPar, consumePar, setUserAuthToken, useParWithCode, } from "./model/par";
import applicationConfig from './config'
import { isEmailWhitelisted } from "./service/util";

const PUBLIC_PATH = path.resolve(path.join(__dirname, "public"))

export function authN() {
  return express
    .Router()
    .use(databaseMiddleware)
    // .get("/z", async (req, res, next) => {
    //   let token = req.headers["authorization"].split(" ")[1];
    //   jwt.verify(token, tokenSigningKey, function (err) {
    //     res.send(!err);
    //   });
    // })
    .use(
      "/ui",
      webpackBuildProcess.BUILD_ENV === 'development' ?
        createProxyMiddleware({
          target: 'http://127.0.0.1:3000', // target host with the same base path
          changeOrigin: true, // needed for virtual hosted sites
        }) :
        serveSPA({
          indexPath: PUBLIC_PATH + "/index.html",
          publicPath: PUBLIC_PATH,
          replaceToken: "__REPLACE_SERVER_BASE_URL__",
        })
    )
    .use(bodyParser.json(), function (req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      next();
    })
    // .post("/client", (req, res) => {
    //   res.send({
    //     badgeUrl: client.badgeUrl,
    //     website: client.website,
    //     mfaRequired,
    //   });
    // })
    .post("/user/register", async (req, res) => {
      const { password, cell, email } = req.body;
      let errors = {}
      return Promise.resolve()
        .then(() => {
          if (!email) {
            errors.email = 'No email provided.'
          } else if (!isEmailWhitelisted(email)) {
            errors.email = 'This email is not allowed.'
          }
          if (!password) {
            errors.password = 'No password provided.'
          }
          if (Object.keys(errors).length > 0) {
            throw new Error('Form errors.')
          }
          return email
        })
        .then(getUserByEmail)
        .then((user) => !user && createNewUser(email, password, cell))
        .then(() => ({ status: true }))
        .catch((err) => {
          return { status: false, errors }
        })
        .then((payload) => res.send(payload))
    })
    .post("/par", async (req, res) => {
      const { redirect_uri, client_id, code_challenge, state } = req.body;
      return setNewPar({
        redirect_uri,
        client_id,
        code_challenge,
        state,
      })
        .then(({ request_uri }) => `${req.protocol}://${req.get('host')}${req.baseUrl}/ui/login/${request_uri}`)
        .then(loginURL => ({ status: true, loginURL }))
        .catch(() => ({ status: false, }))
        .then((payload) => res.send(payload))
    })
    .post("/par/getAuthCode", async (req, res) => {
      const { email, password, request_uri } = req.body;

      return getUserWithEmailPassword(email, password)
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
    .post("/par/getAuthToken", async (req, res) => {
      const { code, code_verifier } = req.body;
      return useParWithCode(code, code_verifier)
        .then((par) => {
          if (!par) {
            throw new Error('Bad code.')
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
  // .post("/sendMFAcode", async (req, res) => {
  //   const { code } = req.body;
  //   let payload = {
  //     status: false,
  //   };

  //   const { mfa_code } = (await setUserAuthMFACode(code)) || {};
  //   if (mfa_code) payload = { status: true };
  //   res.send(payload);
  // })
  // .post("/verifyMFAcode", async (req, res) => {
  //   const { code, mfa } = req.body;
  //   let payload = {
  //     status: false,
  //   };

  //   const { mfa_verified } = (await verifyUserAuthMFACode(code, mfa)) || {};
  //   if (mfa_verified) payload = { status: true };
  //   res.send(payload);
  // })
  // .post("/refreshAuthToken", async (req, res) => {
  //   const { refreshToken: rToken } = req.body;
  //   let payload = {
  //     status: false,
  //   };
  //   const user = await getUserWithAuthRefreshToken(rToken);
  //   if (user) {
  //     const {
  //       token,
  //       refresh_token: refreshToken,
  //     } = await setUserAuthRefreshToken(rToken);
  //     if (token) payload = { status: true, token, refreshToken };
  //   }
  //   res.send(payload);
  // })
  // .use(authZ())
  // .get("/identicon", (req, res, next) => {
  //   var data = new Identicon(req.user.uuid, 420).toString();
  //   let src = "data:image/png;base64," + data;
  //   res.send({ src });
  // })
  // .get("/whoami", async (req, res, next) => {
  //   let { uuid } = req.user;
  //   res.send({ uuid });
  // });
}
