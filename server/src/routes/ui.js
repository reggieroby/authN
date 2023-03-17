import { serveSPA } from '@codealpha/serve-spa';
import express from "express";
import path from 'path';

// __dirname will be the dist directory at runtime.
const PUBLIC_PATH = path.resolve(path.join(__dirname, "public"))
const isDevelopment = webpackBuildProcess.BUILD_ENV === 'development'
const target = 'http://127.0.0.1:3000'

let findTheUI = (req, res, next) => res.sendStatus(500)
serveSPA({
  indexPath: PUBLIC_PATH + "/index.html",
  publicPath: PUBLIC_PATH,
  replaceToken: "__REPLACE_SERVER_BASE_URL__",
})
  .then((serve) => {
    if (isDevelopment) {
      throw new Error('Dont use servespa in dev')
    }
    return serve
  })
  .then((serve) => {
    findTheUI = serve
  })
  .catch((err) => {
    console.log('Serving UI assets through proxy.')
  })
import('http-proxy-middleware')
  .then((mod) => {
    if (!isDevelopment) {
      throw new Error('Dont use proxy in prod')
    }
    return mod
  })
  .then(({ createProxyMiddleware }) => {
    findTheUI = createProxyMiddleware({
      target, // target host with the same base path
      changeOrigin: true, // needed for virtual hosted sites
    })
  })
  .catch((err) => {
    console.log('Serving UI assets at: ', PUBLIC_PATH)
  })


export const ui = express
  .Router()
  .use('/', (req, res, next) => findTheUI(req, res, next))
