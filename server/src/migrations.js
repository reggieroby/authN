export const runMigrations = (dbQuery, resolve) => (err, set) => {
  if (err) {
    throw err;
  }
  set.addMigration(
    "oauth2",
    async function (next) {
      try {
        await dbQuery(`CREATE TABLE IF NOT EXISTS oauthuser (
          id SERIAL PRIMARY KEY,
          uuid VARCHAR(255),
          email_hash_wsalt VARCHAR(255),
          password_hash_wsalt VARCHAR(255),
          cell_number VARCHAR(255),
          token VARCHAR(1024),
          refresh_token VARCHAR(255),
          par_id INT
        );`);
        await dbQuery(`CREATE TABLE IF NOT EXISTS oauthpar (
          id SERIAL PRIMARY KEY,
          request_uri VARCHAR(1024),
          redirect_uri VARCHAR(1024),
          client_id VARCHAR(255),
          code VARCHAR(512),
          mfa_code VARCHAR(64),
          mfa_verified BOOLEAN,
          code_challenge VARCHAR(255),
          state VARCHAR(255)
        );`);
      } catch (err) {
        console.error(err);
      }
      next();
    },
    function (next) {
      next();
    }
  );
  set.up(function (err) {
    if (err) {
      throw err;
    }
    console.log("oauth migrations successfully ran");
    resolve();
  });
};
