import React, { useEffect, useMemo, useState } from "react";
import { Link, redirect, useParams } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogTitle,
  InputAdornment,
} from "@mui/material";
import { status } from "../util";
import { useAppState } from "../appCtx";
import { AlertMessage } from "../AlertMessage";
import { EmailField } from "../compLib/EmailField"
import { PasswordField } from "../compLib/PasswordField"
import { TextField } from "../compLib/TextField"

const emailNotWhitelistedText = "Email not listed for Registration.";

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

  const [validEmail, setValidEmail] = useState(false);
  const [validatingEmail, setValidatingEmail] = useState(false);
  const [open, setOpen] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const isSignupAllowed = useMemo(() => email && validEmail && password,
    [email, validEmail, password])
  function processResponse({ status }) {
    if (!status) {
      setOpenAlert(true);
      return;
    } else {
      dispatch({ type: "updateOAuth2", oauth2: { isRegistered: true } });
    }
  }
  const onEnter = (e) => {
    setOpenAlert(false);
    if (!(email && validEmail && password && e.keyCode === 13)) return;
    fetch(`${basePath}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, cell }),
    })
      .then(status)
      .then(processResponse)
      .catch(console.error);
  };
  function validateWhitelistedEmail() {
    setValidatingEmail(true);
    fetch(`${basePath}/register/validateEmail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })
      .then(status)
      .then(({ status: valid }) => {
        setValidEmail(valid);
        setOpen(email && !valid);
      })
      .catch(console.error)
      .finally(() => setValidatingEmail(false));
  }

  function updateUser(user) {
    dispatch({ type: "updateUser", user });
  }
  if (isRegistered) {
    return redirect(`/login/${request_uri}`)
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
        <h2 style={{ marginTop: "10px" }}>Register</h2>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <EmailField
          required
          autoFocus
          onKeyUp={onEnter}
          onBlur={() => validateWhitelistedEmail()}
          value={email}
          onChange={(email) => updateUser({ email: email.toLowerCase() })}
        />
        <PasswordField
          required
          onKeyUp={onEnter}
          value={password}
          onChange={(password) => updateUser({ password })}
        />
        <TextField
          label="Cell Phone"
          placeholder="+1 555 555 5555"
          onKeyUp={onEnter}
          value={cell}
          onChange={(cell) => updateUser({ cell })}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={(e) => onEnter({ keyCode: 13 })}
          style={{ marginTop: "5px" }}
          disabled={!isSignupAllowed}
        >
          Sign Up
        </Button>
        <hr />
        <Link
          to={`/login/${request_uri}`}
          style={{ color: "blue", textDecoration: "none", alignSelf: "center" }}
          underline="none"
        >
          <Button variant="outlined">Login</Button>
        </Link>
      </div>
      <Dialog onClose={() => setOpen(false)} open={open}>
        <DialogTitle id="simple-dialog-title">
          {emailNotWhitelistedText}
        </DialogTitle>
        <Button variant="contained" onClick={() => setOpen(false)}>
          Ok
        </Button>
      </Dialog>
      <AlertMessage
        message="Registration Failed"
        open={openAlert}
        setter={setOpenAlert}
      />
    </div>
  );
}