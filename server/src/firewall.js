import express from "express";
import passport from "passport";
import BearerStrategy from "passport-http-bearer";

export function firewall({ getUserWithAuthToken }) {
  passport.use(
    new BearerStrategy(function (token, done) {
      return getUserWithAuthToken(token)
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
