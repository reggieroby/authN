import express from "express";
import passport from "passport";
import BearerStrategy from "passport-http-bearer";
import { poolQuery } from "./datastore/accessor";

async function getUserWithAuthToken(token) {
  const {
    rows: [user],
  } = await poolQuery(`SELECT * FROM oauthuser WHERE token = '${token}'`);
  return user;
}

export function authZ() {
  passport.use(
    new BearerStrategy(async (token, done) => {
      return getUserWithAuthToken(query, token)
        .then((user) => {
          return user ? done(null, user) : done(null, false);
        })
        .catch((err) => done(err));
    })
  );
  return express
    .Router()
    .use(
      passport.authenticate("bearer", { session: false }),
      (req, res, next) => {
        req.user
          ? next()
          : res.status(401).json({ errors: "unauthorized request" });
      }
    );
}
