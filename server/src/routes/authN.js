import express from "express";
import { clientRoutes, mfaRoutes, parRoutes, userRoutes, ui } from ".";

export const authN = express
  .Router()
  .use('/user', userRoutes)
  .use('/par', parRoutes)
  .use('/mfa', mfaRoutes)
  .use('/client', clientRoutes)
  .use("/ui", ui)