import express from "express";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import Identicon from "identicon.js";
import { firewall } from "./firewall";
import path from 'path';
import { serveSPA } from '@codealpha/serve-spa'
import { createProxyMiddleware } from 'http-proxy-middleware';

const PUBLIC_PATH = path.resolve(path.join(__dirname, "public"))

export async function routes(
  {
    setUserAuthToken,
    setUserAuthRefreshToken,
    setUserAuthMFACode,
    setNewUser,
    getUserWithEmailPassword,
    getUserWithEmail,
    getUserWithAuthRefreshToken,
    verifyUserAuthMFACode,
    setNewPar,
    usePar,
    attachUsersPar,
    useParWithCode,
    getUserWithAuthToken,
  },
  { mfaRequired, client, registrationWhitelist, tokenSigningKey }
) {
  return express
    .Router()
    .get("/z", async (req, res, next) => {
      let token = req.headers["authorization"].split(" ")[1];
      jwt.verify(token, tokenSigningKey, function (err) {
        res.send(!err);
      });
    })
    .use(
      "/ui",
      webpackBuildProcess.BUILD_ENV === 'development' ?
        createProxyMiddleware({
          target: 'http://127.0.0.1:3000', // target host with the same base path
          changeOrigin: true, // needed for virtual hosted sites
        }) :
        await serveSPA({
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
    .post("/client", (req, res) => {
      res.send({
        badgeUrl: client.badgeUrl,
        website: client.website,
        mfaRequired,
      });
    })
    .post("/register", async (req, res) => {
      let status = false;
      const { password, cell } = req.body;
      const email = req.body.email.toLowerCase()
      if (
        registrationWhitelist.length &&
        !registrationWhitelist.includes(email)
      )
        return res.send({ status });

      const emailUser = await getUserWithEmail(email);
      if (!emailUser) {
        const user = await setNewUser(email, password, cell);
        status = !!user;
      }
      res.send({ status });
    })
    .post("/register/validateEmail", async (req, res) => {
      const { email } = req.body;
      return res.send({
        status: registrationWhitelist.length
          ? registrationWhitelist.includes(email.toLowerCase())
          : true,
      });
    })
    .post("/par", async (req, res) => {
      const { redirect_uri, client_id, code_challenge, state } = req.body;
      let payload = {
        status: false,
      };
      const par = await setNewPar({
        redirect_uri,
        client_id,
        code_challenge,
        state,
      });
      if (par) {
        const { request_uri } = par;
        if (request_uri) payload = { status: true, request_uri };
      }
      res.send(payload);
    })
    .post("/getAuthCode/:par_request_uri", async (req, res) => {
      const { par_request_uri } = req.params;
      let payload = {
        status: false,
        mfaRequired,
      };
      const { email, password } = req.body;
      try {
        const currentUser = await getUserWithEmailPassword(email.toLowerCase(), password);
        if (currentUser) {
          const { id } = await usePar(par_request_uri);
          const { code, state, redirect_uri } = await attachUsersPar(
            currentUser.id,
            id
          );
          if (code && state) {
            payload = { ...payload, status: true, code, state, redirect_uri };
          }
        }
      } catch (err) {
        console.error(err);
      }
      res.send(payload);
    })
    .post("/sendMFAcode", async (req, res) => {
      const { code } = req.body;
      let payload = {
        status: false,
      };

      const { mfa_code } = (await setUserAuthMFACode(code)) || {};
      if (mfa_code) payload = { status: true };
      res.send(payload);
    })
    .post("/verifyMFAcode", async (req, res) => {
      const { code, mfa } = req.body;
      let payload = {
        status: false,
      };

      const { mfa_verified } = (await verifyUserAuthMFACode(code, mfa)) || {};
      if (mfa_verified) payload = { status: true };
      res.send(payload);
    })
    .post("/getAuthToken", async (req, res) => {
      const { code, code_verifier } = req.body;
      let payload = {
        status: false,
      };
      const par = await useParWithCode(code, code_verifier);
      if (par && (!mfaRequired || par.mfa_verified)) {
        const { token, refresh_token: refreshToken } = await setUserAuthToken(
          par.id
        );
        if (token) payload = { status: true, token, refreshToken };
      }
      res.send(payload);
    })
    .post("/refreshAuthToken", async (req, res) => {
      const { refreshToken: rToken } = req.body;
      let payload = {
        status: false,
      };
      const user = await getUserWithAuthRefreshToken(rToken);
      if (user) {
        const {
          token,
          refresh_token: refreshToken,
        } = await setUserAuthRefreshToken(rToken);
        if (token) payload = { status: true, token, refreshToken };
      }
      res.send(payload);
    })
    .use(firewall({ getUserWithAuthToken }))
    .get("/identicon", (req, res, next) => {
      var data = new Identicon(req.user.uuid, 420).toString();
      let src = "data:image/png;base64," + data;
      res.send({ src });
    })
    .get("/whoami", async (req, res, next) => {
      let { uuid } = req.user;
      res.send({ uuid });
    });
}
