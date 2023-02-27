import React from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CloseIcon from "@mui/icons-material/Close";

export function AlertMessage({ message, open, setter }) {
  const handleClick = () => {
    setter(true);
  };

  const handleClose = (event, reason) => {
    setter(false);
  };
  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        variant="filled"
        severity="error"
        action={
          <CloseIcon
            fontSize="inherit"
            onClick={() => {
              setter(false);
            }}
          />
        }
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
