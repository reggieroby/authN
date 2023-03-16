import { authN, authZ } from './routes'
import { initializeDB } from "./datastore/accessor";
import applicationConfig from './config'

export const oauth = async (config) => {
  await applicationConfig.set(config)
  await initializeDB();

  return { authN, authZ };
};
