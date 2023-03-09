import React, { useMemo } from "react";
import { TextField, defaultData as textFieldDefaultData } from './TextField'

export function EmailField(props) {
  const {
    ...passThrough
  } = useDefaultData(props)

  return (<div className="EmailFieldRoot">
    <TextField
      label={defaultData.label}
      {...passThrough}
      type={defaultData.type}
    />
  </div>);
}

export const defaultData = { label: "Email", type: "email" }

function useDefaultData(props) {
  return useMemo(
    () => ({
      ...textFieldDefaultData,
      ...defaultData,
      ...props,
    }),
    [props],
  );
}