import { routes } from "./routes";
import { firewall } from "./firewall";
import { initializeDB, DB } from "./datastore";
import { userFunctions } from "./userFunctions";
import { sendSMS as SMS } from "./sendSMS";

export const oauth = async ({
  database: { config },
  emailSalt = null,
  tokenSigningKey,
  mfaRequired = false,
  registrationWhitelist = [],
  client = { name: "OAuth2", website: "OAuth2" },
  awsCredentialsPath,
} = {}) => {
  const dbQuery = await DB(config);
  await initializeDB({ dbQuery });
  let sendSMS = () => {
    console.error("SMS not implemented, missing AWS credentials");
  };
  if (mfaRequired && awsCredentialsPath) {
    sendSMS = SMS(awsCredentialsPath);
  }
  if (!tokenSigningKey) {
    throw new Error("tokenSigningKey not set.")
  }
  const userFncs = userFunctions({
    dbQuery,
    emailSalt,
    client,
    sendSMS,
    tokenSigningKey,
  });

  return {
    authN: await routes(userFncs, {
      client,
      mfaRequired,
      registrationWhitelist,
      tokenSigningKey,
    }),
    authZ: firewall(userFncs),

  };
};
