import { encodeData, bcryptSalt, hexDigest, sha512Hash } from './service/crypto'
import chalk from 'chalk';

class ApplicationConfiguration {
  #config;

  constructor() {
    this.#config = {};
  }

  get() {
    return this.#config;
  }

  async set(appConfig) {
    let config = {
      mfaRequired: false,
      registrationWhitelist: [],
      client: { name: "OAuth2", website: "OAuth2" },
      ...appConfig,
    }

    if (!config.tokenSigningKey) {
      config.tokenSigningKey = await sha512Hash(encodeData(crypto.randomUUID()))
        .then(hexDigest)
      console.info(chalk.yellow(`tokenSigningKey was not provided. A random one will be created.`))
      console.info(chalk.greenBright(`tokenSigningKey = "${config.tokenSigningKey}"`))
    }

    if (!config.emailSalt) {
      config.emailSalt = bcryptSalt()
      console.info(chalk.yellow(`emailSalt was not provided. A random one will be created.`))
      console.info(chalk.greenBright(`emailSalt = "${config.emailSalt}"`))
    }



    // console.info(chalk.black(`tokenSigningKey was not provided. A random one will be created.`))
    // console.info(chalk.red(`tokenSigningKey was not provided. A random one will be created.`))
    // console.info(chalk.green(`tokenSigningKey was not provided. A random one will be created.`))
    // console.info(chalk.yellow(`tokenSigningKey was not provided. A random one will be created.`))
    // console.info(chalk.blue(`tokenSigningKey was not provided. A random one will be created.`))
    // console.info(chalk.magenta(`tokenSigningKey was not provided. A random one will be created.`))
    // console.info(chalk.cyan(`tokenSigningKey was not provided. A random one will be created.`))
    // console.info(chalk.white(`tokenSigningKey was not provided. A random one will be created.`))
    // console.info(chalk.gray(`tokenSigningKey was not provided. A random one will be created.`))
    // console.info(chalk.greenBright(`tokenSigningKey was not provided. A random one will be created.`))
    // console.info(chalk.yellowBright(`tokenSigningKey was not provided. A random one will be created.`))
    // console.info(chalk.blueBright(`tokenSigningKey was not provided. A random one will be created.`))
    // console.info(chalk.magentaBright(`tokenSigningKey was not provided. A random one will be created.`))
    // console.info(chalk.cyanBright(`tokenSigningKey was not provided. A random one will be created.`))
    // console.info(chalk.whiteBright(`tokenSigningKey was not provided. A random one will be created.`))

    this.#config = config
  }
}

export default new ApplicationConfiguration();
