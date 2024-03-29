<p style="text-align:center">
  <img src="https://raw.githubusercontent.com/reggieroby/authN/main/client/public/authLogo.png" alt="AuthN Logo">
</p>

# AuthN

Faux IAM.

reference material:
  - [OAuth2](https://tools.ietf.org/html/rfc6749) Authorization framework.
  - [PAR](https://www.rfc-editor.org/rfc/rfc9126) Auth flow: Pushed Authorization Request
  - [PKCE](https://www.rfc-editor.org/rfc/rfc7636) Additional security: Proof-Key for Code Exchange.
  - [Authorization Code](https://oauth.net/2/grant-types/authorization-code/) Auth Grant Type.
  - [Bearer Token](https://oauth.net/2/bearer-tokens/) Authentication usage mechanism.

# Installation
```bash
npm i @codealpha/oauth2 --save
```

# Example
```js
import {oauth} from '@codealpha/oauth2'
const oauthConfig = {...}

const Server = async () => {
  const { authN, authZ } = await oauth(oauthConfig);

  app
    .use(express.static(path.join(__dirname, "public")))
    .use("/auth", authN)
    .use("/private/stuff", [
      authZ,
      (req, res) => {
        res.send({ message: "welcome VIP", data: ["a", 2, { b: true }] });
      },
    ])
    .listen(5000, () => {
      console.log(`OAuth2 Server started at http://localhost:5000`);
    });
};
```

# Usage

### authN
```js
.use("/auth", authN)
```

_"/ui"_: 
  - AS User Interface

_"/client"_:
  - data about the website using the AS

_"/user/whoami"_:
  - user object

### authZ
```js
.use("/private/stuff",
      authZ,
      (req, res) => {
        res.send({ message: "welcome VIP", data: ["a", 2, { b: true }] });
      },
    )
```

# ClientSide Callback workflow
Post login:
1) client website recieves `authCode`.
2) client website exchanges `authCode` for `authToken`.
3) client website uses `authToken` to make API requests.


# Configuration

```js
const oauthConfig = {
  database: {
    type: "postgres",
    config: {
      user: "DATABASE_USERNAME",
      host: "DATABASE_HOST",
      password: "DATABASE_PASSWORD",
      port: 5432,
    },
  },
};
```
| key        | Description           | Default  |
| ------------- |-----------| -----:|
| awsCredentialsPath      | the absolute file path to the AWS [credentials.json](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-json-file.html) file |  |
| mfaRequired     | a SMS code is required on login in addition to a username/password.     |   false |
| emailSalt | a bcrypt salt used to encrypt data at rest      |    no encryption |
| database * |  |  |
| database.type | type of database | [string] |
| database.config | configuration object specific to a database | [Object] |
| client |  |  |
| client.name | name of website using OAuth2 | 'OAuth2Placeholder' |
| client.website | fqdn of website using OAuth2 | 'OAuth2Placeholder' |
| client.badgeUrl | url of brand image used to customize OAuth2 pages |  |
|registrationWhitelist | only allow a defined list of usernames to register | any |

# Running Example (dev mode)
## Authentication Server UI
1) Start client
    1) cd to /client
    2) run:
        ```bash
        npm start
        ```
## Build server & end-user functions
2) Setup initial builds and watch for changes.
    1) from project root
    2) run:
        ```bash
        npm run cli start
        ```
## Example end-user application
3) Start Example
    - make sure your postgres database is up and running.
    - fill in correct [environment variables](example/config.js)
    1) from project root
    2) run: 
        ```bash
        npm run cli example
        ```

# Publishing npm module.
1) Login NPM.
  * With CLI.
      1) run:
          ```bash
          npm login
          ```
          - Login will ask to open browser. Follow instructions for MFA/OTP.
  * With [granular access token](https://www.npmjs.com/settings/catech/tokens/granular-access-tokens/new).
      - [StackOverflow issue](https://stackoverflow.com/questions/65851190/how-do-i-publish-a-package-to-npm-using-an-api-key)
      1) run:
          ```bash
          npm config set _authToken=GRANULAR_ACCESS_TOKEN
          ```
          * if you get an error like `Invalid auth configuration found: '_authToken' must be renamed to '//registry.npmjs.org/:_authToken' in user config`.
          1) run:
              ```bash
              npm config fix
              ```
2) Publish to NPM.
    - from project root
    2) run:
        ```bash
        npm run publishit
        ```
3) Logout NPM.
    - from project root
    2) run:
        ```bash
        npm logout
        ```
