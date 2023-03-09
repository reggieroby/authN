import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { status } from "../util";
import { useAppState } from "../appCtx";
import { AlertMessage } from "../comp/AlertMessage";
import { EmailField } from "../compLib/EmailField"
import { Button } from "../compLib/Button"
import { PasswordField } from "../compLib/PasswordField"

export function Register() {
  let { request_uri } = useParams();
  const [
    {
      user: { email, password, cell },
      client: { badgeUrl },
      oauth2: { isRegistered },
      basePath,
    },
    dispatch,
  ] = useAppState();
  const navigate = useNavigate()
  const [errors, setErrors] = useState({});
  const alertAccessor = useState(false);
  const setOpenAlert = useCallback(alertAccessor[1], [alertAccessor])
  const isSignupAllowed = useMemo(
    () => email && password,
    [email, password]
  )
  const updateUser = useCallback((user) => {
    dispatch({ type: "updateUser", user });
  }, [dispatch])
  const onEnter = (e) => {
    setOpenAlert(false);
    if (!(isSignupAllowed && e.keyCode === 13)) return;

    setErrors({})
    fetch(`${basePath}/user/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, cell }),
    })
      .then(status)
      .then(function processResponse({ status, errors }) {
        if (!status && errors) {
          setErrors(errors)
        } else if (!status) {
          setOpenAlert(true);
          return;
        } else {
          dispatch({ type: "updateOAuth2", oauth2: { isRegistered: true } });
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    isRegistered && navigate(`/login/${request_uri}`)
  }, [isRegistered])

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
        <h2 style={{ marginTop: "10px" }}>Register</h2>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <EmailField
          required
          error={errors.email}
          autoFocus
          fullWidth
          onKeyUp={onEnter}
          value={email}
          onChange={(email) => updateUser({ email: email.toLowerCase() })}
        />
        <PasswordField
          error={errors.password}
          required
          onKeyUp={onEnter}
          value={password}
          onChange={(password) => updateUser({ password })}
        />
        <Button
          onClick={(e) => onEnter({ keyCode: 13 })}
          style={{ marginTop: "5px" }}
          disabled={!isSignupAllowed}
          text="Sign Up"
        />
        <hr style={{ margin: "1.5rem .5rem", border: '1px solid slategrey', }} />
        <Link
          to={`/login/${request_uri}`}
          style={{ color: "blue", textDecoration: "none", alignSelf: "center", width: '90%' }}
          underline="none"
        >
          <Button variant="outlined" text="Login" fullWidth />
        </Link>
      </div>
      <AlertMessage
        message="Registration Failed"
        accessor={alertAccessor}
      />
    </div>
  );
}