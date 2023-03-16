import express from "express";
import applicationConfig from '../config'

export const Routes = express
  .Router()
  .post("/", (req, res) => {
    let { badgeUrl, website } = applicationConfig.get().client

    return res.send({
      badgeUrl,
      website
    });
  })