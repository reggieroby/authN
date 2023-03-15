import express from "express";
import path from 'path';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { databaseMiddleware } from "./datastore/accessor";
import { serveSPA } from '@codealpha/serve-spa'
import { parRoutes, userRoutes } from "./routes";

const PUBLIC_PATH = path.resolve(path.join(__dirname, "public"))

export const authN = express
  .Router()
  .use(databaseMiddleware)
  .use('/user', userRoutes)
  .use('/par', parRoutes)
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
  // .post("/client", (req, res) => {
  //   res.send({
  //     badgeUrl: client.badgeUrl,
  //     website: client.website,
  //     mfaRequired,
  //   });
  // })
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
  // });