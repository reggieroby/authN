import express from "express";
import passport from "passport";
import BearerStrategy from "passport-http-bearer";
import { getUserByAuthToken } from "../model/user";

passport.use(
  new BearerStrategy(async (token, done) => {
    return getUserByAuthToken(token)
      .then((user) => {
        return user ? done(null, user) : done(null, false);
      })
      .catch((err) => done(err));
  })
);

export const authZ = [
  passport.authenticate("bearer", { session: false }),
  (req, res, next) => {
    req.user
      ? next()
      : res.status(401).json({ errors: "Unauthorized request." });
  }
]
