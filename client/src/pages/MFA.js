import React, { useEffect, useState } from "react";
import { TextField } from "@mui/material";
import { status } from "../util";
import { useAppState } from "../appCtx";
import { AlertMessage } from "../AlertMessage";

export function MFA() {
  const [
    {
      client: { badgeUrl },
      oauth2: { code, mfa, mfaVerified, redirect_uri },
      basePath,
    },
    dispatch,
  ] = useAppState();
  const [openAlert, setOpenAlert] = useState(false);
  useEffect(() => {
    fetch(`${basePath}/sendMFAcode`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });
  }, []);
  function processResponse({ status, code, mfaRequired }) {
    if (!status) {
      setOpenAlert(true);
      return;
    } else {
      dispatch({ type: "updateOAuth2", oauth2: { mfaVerified: status } });
    }
  }
  const onEnter = (e) => {
    setOpenAlert(false);
    if (!(mfa && e.keyCode === 13)) return;
    fetch(`${basePath}/verifyMFAcode`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code, mfa }),
    })
      .then(status)
      .then(processResponse)
      .catch(console.error);
  };
  if (mfaVerified) {
    window.location.href = `${redirect_uri}?code=${code}`;
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
        <h2 style={{ marginTop: "10px" }}>Multi Factor Authentication</h2>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <TextField
          required
          label="One Time Passcode"
          placeholder="123456"
          type="text"
          variant="filled"
          margin="dense"
          onKeyUp={onEnter}
          onChange={(e) =>
            dispatch({ type: "updateOAuth2", oauth2: { mfa: e.target.value } })
          }
        />
      </div>
      <AlertMessage
        message="Incorrect MFA code."
        open={openAlert}
        setter={setOpenAlert}
      />
    </div>
  );
}
