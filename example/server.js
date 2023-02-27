import express from "express";
import path from "path";
import { oauth } from "../dist";
import { randomUUID, createHash, } from 'crypto'
import { genSaltSync } from "bcryptjs";
import { appPort, postgresConfig, clientConfig } from "./config"

const app = express();

const oauthConfig = {
  awsCredentialsPath: path.join(__dirname, "credentials.json"),
  mfaRequired: false,
  emailSalt: genSaltSync(),
  tokenSigningKey: createHash("sha256")
    .update(randomUUID())
    .digest("hex"),
  database: {
    type: "postgres",
    config: postgresConfig,
  },
  client: clientConfig,
};

export const Server = async () => {

  const { authN, authZ } = await oauth(oauthConfig);

  app
    .use(express.static(path.join(__dirname, "public")))
    .use("/fn", express.static(path.join(__dirname, "../functions")))
    .use("/auth", authN)
    .get("/private/stuff", [
      authZ,
      (req, res, next) => {
        res.send({ message: "welcome VIP", data: ["a", 2, { b: true }] });
      },
    ])
    .listen(appPort, () => {
      console.log(`ACME lmtd server listening at http://localhost:${appPort}`);
    });
};
