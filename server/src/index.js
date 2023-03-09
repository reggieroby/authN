import { authN } from "./authN";
import { authZ } from "./authZ";
import { initializeDB } from "./datastore/accessor";
import applicationConfig from './config'

export const oauth = async (config) => {
  await applicationConfig.set(config)
  await initializeDB();

  return {
    authN: authN(),
    authZ: authZ(),
  };
};
