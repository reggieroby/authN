import React, { useMemo } from "react";
import {
  Button as MUIButton,
} from "@mui/material";

export function Button(props) {
  const {
    text,
    ...passthrough
  } = useDefaultData(props)

  return (<MUIButton
    className="ButtonRoot"
    {...passthrough}
  >
    {text}
  </MUIButton>);
}

export const defaultData = {
  text: "Click me!",
  variant: "contained",
  disabled: false,
  onClick() { },
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
