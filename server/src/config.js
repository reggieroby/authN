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
      // FQDN: "https://my.fullyQualifiedDomainName.com", used to resolve correct resource URL behind a load balancer.
      mfaRequired: false,
      registrationWhitelist: [],
      client: { name: "AuthServer", website: "AuthServer" },
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



    // chalk colors:
    // black, red, green, yellow, blue, magenta, cyan, white, gray, greenBright, yellowBright, blueBright, magentaBright, cyanBright, whiteBright,
    this.#config = config
  }
}

export default new ApplicationConfiguration();
