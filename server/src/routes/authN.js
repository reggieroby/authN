import express from "express";
import path from 'path';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { serveSPA } from '@codealpha/serve-spa'
import { clientRoutes, mfaRoutes, parRoutes, userRoutes } from ".";

// __dirname will be the dist directory at runtime.
const PUBLIC_PATH = path.resolve(path.join(__dirname, "public"))

export const authN = express
  .Router()
  .use('/user', userRoutes)
  .use('/par', parRoutes)
  .use('/mfa', mfaRoutes)
  .use('/client', clientRoutes)
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