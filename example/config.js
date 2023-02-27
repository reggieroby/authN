
export const appPort = process.env.APPLICATION_PORT || 3001
export const postgresConfig = {
  user: process.env.DATABASE_USER || "dbuser",
  host: process.env.DATABASE_HOST || "localhost",
  password: process.env.DATABASE_PASSWORD || "secretPassword",
  port: process.env.DATABASE_PORT || 5432,
}
export const clientConfig = {
  name: "ACME lmtd",
  website: "acme.example",
  badgeUrl: `http://localhost:${appPort}/acmeLogo.png`,
}