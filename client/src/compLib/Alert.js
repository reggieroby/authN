import React, { useMemo } from "react";
import {
  Alert as MUIAlert,
  AlertTitle,
} from "@mui/material";

export function Alert(props) {
  const {
    text,
    title,
    ...passthrough
  } = useDefaultData(props)

  return (<MUIAlert
    className="AlertRoot"
    {...passthrough}
  >
    {title && <AlertTitle>{title}</AlertTitle>}
    {text}
  </MUIAlert>);
}

export const defaultData = {
  text: "This is the main content",
  severity: "error",
  variant: "standard",
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
