import React, { useState } from "react";
import { Link, redirect, useParams } from "react-router-dom";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { status } from "../util";
import { useAppState } from "../appCtx";
import { AlertMessage } from "../AlertMessage";

export function Login() {
  let { request_uri } = useParams();
  const [
    {
      basePath,
      user: { email, password },
      client: { badgeUrl, mfaRequired },
      oauth2: { redirect_url },
    },
    dispatch,
  ] = useAppState();
  const [openAlert, setOpenAlert] = useState(false);

  function processResponse({ status, code, state, redirect_uri }) {
    if (!status) {
      setOpenAlert(true);
      return;
    } else {
      dispatch({ type: "updateOAuth2", oauth2: { code, redirect_uri, state } });
    }
  }
  function fetchAuthCode() {
    fetch(`${basePath}/getAuthCode/${request_uri}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then(status)
      .then(processResponse)
      .catch(console.error);
  }
  const onEnter = (e) => {
    setOpenAlert(false);
    if (!(email && password) || e.keyCode !== 13) return;
    fetchAuthCode();
  };
  const onLoginBtn = (e) => {
    if (!(email && password)) return;
    fetchAuthCode();
  };

  if (redirect_url) {
    if (mfaRequired) {
      return redirect("/mfa");
    } else {
      window.location.href = redirect_url;
    }
  }
  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <img
          style={{ display: badgeUrl ? "initial" : "none", height: "50px" }}
          src={badgeUrl}
        />
        <h2 style={{ marginTop: "10px" }}>Login</h2>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <TextField
          autoFocus={true}
          required
          label="Email"
          type="text"
          variant="outlined"
          margin="dense"
          onKeyUp={onEnter}
          value={email}
          onChange={(e) =>
            dispatch({
              type: "updateUser",
              user: { email: e.target.value.toLowerCase() },
            })
          }
        />
        <TextField
          required
          label="Password"
          type="password"
          variant="outlined"
          margin="dense"
          onKeyUp={onEnter}
          value={password}
          onChange={(e) =>
            dispatch({
              type: "updateUser",
              user: { password: e.target.value }
            })
          }
        />
        <Button
          variant="contained"
          color="primary"
          onClick={onLoginBtn}
          style={{ marginTop: "5px" }}
        >
          Login
        </Button>
        <hr />
        <Link
          to={`/register/${request_uri}`}
          style={{ color: "blue", textDecoration: "none", alignSelf: "center" }}
          underline="none"
        >
          <Button variant="outlined">Create Account</Button>
        </Link>
      </div>
      <AlertMessage
        message="Login Failed"
        open={openAlert}
        setter={setOpenAlert}
      />
    </div>
  );
}
