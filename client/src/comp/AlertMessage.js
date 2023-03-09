import React from "react";
import { Snackbar } from "../compLib/Snackbar";
import { Alert } from "../compLib/Alert";

export function AlertMessage({ text, accessor, vertical = "top", horizontal = "right" }) {
  return (
    <Snackbar
      accessor={accessor}
      anchorOrigin={{ vertical, horizontal }}
    >
      <div>
        <Alert
          severity="error"
          text={text}
        />
      </div>
    </Snackbar>
  );
}
