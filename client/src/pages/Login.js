import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { EmailField } from "../compLib/EmailField"
import { PasswordField } from "../compLib/PasswordField"
import { Button } from "../compLib/Button"
import { status } from "../util";
import { useAppState } from "../appCtx";
import { AlertMessage } from "../comp/AlertMessage";

export function Login() {
  let { request_uri } = useParams();
  const [
    {
      basePath,
      user: { email, password },
      client: { badgeUrl },
      oauth2: { redirect_url, isRegistered },
    },
    dispatch,
  ] = useAppState();
  const alertAccessor = useState(false);
  const setOpenAlert = useCallback(alertAccessor[1], [alertAccessor])

  const isLoginAllowed = useMemo(
    () => email && password,
    [email, password]
  )

  function fetchAuthCode() {
    fetch(`${basePath}/par/getAuthCode`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, request_uri }),
    })
      .then(status)
      .then(function processResponse({ status, code, state, redirect_uri }) {
        return status ?
          dispatch({ type: "updateOAuth2", oauth2: { code, redirect_uri, state } }) :
          setOpenAlert(true)
      })
      .catch(console.error);
  }
  const onEnter = (e) => {
    setOpenAlert(false);
    if (!(email && password) || e.keyCode !== 13) return;
    fetchAuthCode();
  };
  const onLoginBtn = (e) => {
    setOpenAlert(false);
    if (!(email && password)) return;
    fetchAuthCode();
  };

  const updateUser = useCallback((user) => {
    dispatch({ type: "updateUser", user });
  }, [dispatch])

  useEffect(() => {
    isRegistered && fetchAuthCode()
  }, [])

  if (redirect_url) {
    window.location.href = redirect_url;
  }

  if (isRegistered) {
    return <div>Logging in...</div>
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
        <EmailField
          fullWidth
          required
          autoFocus
          onKeyUp={onEnter}
          value={email}
          onChange={(email) => updateUser({ email: email.toLowerCase() })}
        />
        <PasswordField
          fullWidth
          required
          onKeyUp={onEnter}
          value={password}
          onChange={(password) => updateUser({ password })}
        />
        <Button
          style={{ marginTop: ".5rem" }}
          text="Login"
          onClick={onLoginBtn}
          disabled={!isLoginAllowed}
        />
        <hr style={{ margin: "1.5rem .5rem", border: '1px solid slategrey', }} />
        <Link
          to={`/register/${request_uri}`}
          style={{ color: "blue", textDecoration: "none", alignSelf: "center", width: "90%" }}
          underline="none"
        >
          <Button text="Create Account" variant="outlined" fullWidth />
        </Link>
      </div>
      <AlertMessage
        text="Login Failed"
        accessor={alertAccessor}
      />
    </div>
  );
}
