import React, { useMemo } from "react";
import {
  Snackbar as MUISnackbar,
} from "@mui/material";
import { useValueAccessor } from "./hooks";

export function Snackbar(props) {
  const {
    open: incomingValue, accessor,
    onClose,
    horizontal, vertical,
    children,
    ...passthrough
  } = useDefaultData(props)
  const [open, setOpen] = useValueAccessor(incomingValue, accessor)

  return (<MUISnackbar
    className="SnackbarRoot"
    open={open}
    anchorOrigin={{ vertical, horizontal }}
    {...passthrough}
    onClose={() => {
      setOpen(false)
      onClose()
    }}
  >
    <div className="SnackbarContent">
      {children}
    </div>
  </MUISnackbar>);
}

export const defaultData = {
  horizontal: "right",
  vertical: "bottom",
  autoHideDuration: 5000,
  onClose() { },
}
function useDefaultData(props) {
  return useMemo(
    () => ({
      ...defaultData,
      ...props
    }),
    [props],
  );
}
