export async function OAuth2Login({
  auth_uri,
  redirect_uri,
  preLogin = async () => { },
  postLogin = async (..._) => console.log(..._),
  loginErr = console.err,
}) {
  if (!getParam("code")) {
    const { state, code_verifier, code_challenge } = await requestContinuity();
    sessionStorage.setItem("ca_oauth2_state", state);
    sessionStorage.setItem("ca_oauth2_code_verifier", code_verifier);

    Promise.resolve()
      .then(preLogin)
      .then(() => fetchit(`${auth_uri}/par`, { redirect_uri, state, code_challenge }))
      .then(({ status, loginURL }) => {
        if (!status) {
          throw new Error("Login initiation failed")
        }
        window.location.href = loginURL;
      })
      .catch((err) => {
        loginErr({ err });
      });
  } else if (getParam("state") === sessionStorage.getItem("ca_oauth2_state")) {
    fetchit(`${auth_uri}/par/getAuthToken`, {
      code: getParam("code"),
      code_verifier: sessionStorage.getItem("ca_oauth2_code_verifier"),
    })
      .then(({ status, token }) => {
        if (!status) {
          throw new Error("Code exchange failed.")
        }
        return token;
      })
      .then(postLogin)
      .catch((err) => {
        loginErr({ err });
      });
  } else {
    loginErr({ err: "State mismatch. Code exchange terminated." });
  }
}

async function fetchit(url, data) {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(status);
}

async function status(response) {
  if (response.status >= 200 && response.status < 300) {
    return await response.json();
  }
  const err = new Error(response.statusText);
  console.log(err);
  console.error({ message: err.message, ...err });
  throw err;
}

function getParam(key) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(key);
}
async function requestContinuity() {
  const state = nanoid(128);
  const { code_verifier, code_challenge } = await generateCodeChallenge();

  return { state, code_verifier, code_challenge };
}

async function generateCodeChallenge() {
  const code_verifier = nanoid(128);
  const encoded_verifier = new TextEncoder().encode(code_verifier);
  const sha512_verifier = await window.crypto.subtle.digest(
    "SHA-512",
    encoded_verifier
  );
  const code_challenge = Array.from(new Uint8Array(sha512_verifier))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return { code_verifier, code_challenge };
}

function nanoid(length) {
  const alphanumeric =
    "1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
  return [...window.crypto.getRandomValues(new Uint8Array(length))]
    .map((n) => alphanumeric[n % 62])
    .join("");
}
