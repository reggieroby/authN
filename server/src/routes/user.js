import express from "express";
import Identicon from "identicon.js";
import { authZ } from "./authZ";
import { getUserByEmail, createNewUser } from "../model/user";
import { isEmailWhitelisted } from "../service/util";
import { jsonBodyParser } from "./util";

export const Routes = express
  .Router()
  .use(jsonBodyParser)
  .post("/register", async (req, res) => {
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
  .use(authZ)
  .get("/identicon", (req, res, next) => {
    var data = new Identicon(req.user.uuid, 420).toString();
    let src = "data:image/png;base64," + data;
    res.send({ src });
  })
  .get("/whoami", async (req, res, next) => {
    let { uuid } = req.user;
    res.send({ uuid });
  });

   // .get("/z", async (req, res, next) => {
  //   let token = req.headers["authorization"].split(" ")[1];
  //   jwt.verify(token, tokenSigningKey, function (err) {
  //     res.send(!err);
  //   });
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