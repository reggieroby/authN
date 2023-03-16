import express from "express";
import { jsonBodyParser } from "./util";

export const Routes = express
  .Router()
  .use(jsonBodyParser)
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