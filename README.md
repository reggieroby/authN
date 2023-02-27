<p style="text-align:center">
  <img src="https://raw.githubusercontent.com/reggieroby/authN/main/client/public/oauth2logo.png" alt="AuthN Logo">
</p>

# AuthN

Faux IAM.

reference material:
  - [OAuth2 RFC](https://tools.ietf.org/html/rfc6749) specification.
  - [Authorization Code](https://oauth.net/2/grant-types/authorization-code/) Grant Type
  - [Bearer Token](https://oauth.net/2/bearer-tokens/) as an API firewall.

# Installation
```bash
npm install --save @codealpha/oauth2
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
  - OAuth2 User Interface

_"/client"_:
  - data about the website using OAuth2

_"/whoami"_:
  - user object

### authZ
```js
.use("/private/stuff", [
      authZ,
      (req, res) => {
        res.send({ message: "welcome VIP", data: ["a", 2, { b: true }] });
      },
    ])
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
| database (required) |  |  |
| database.type | type of database | [string] |
| database.config | configuration object specific to a database | [Object] |
| client |  |  |
| client.name | name of website using OAuth2 | 'OAuth2Placeholder' |
| client.website | fqdn of website using OAuth2 | 'OAuth2Placeholder' |
| client.badgeUrl | url of brand image used to customize OAuth2 pages |  |
|registrationWhitelist | only allow a defined list of usernames to register | any |





# Development

## Start the example

1) cd to /example
2) run: 
    ```bash
    npm i
    ```
3) make sure your postgres database is up and running.
4) fill in correct [environment variables](example/config.js)
5) run:
    ```bash
    npm run dev
    ```