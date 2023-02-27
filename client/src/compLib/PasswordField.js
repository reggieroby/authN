import React, { useMemo, useState } from "react";
import { useValueAccessor, useUpdate } from "./hooks";
import { TextField, defaultData as textFieldDefaultData } from './TextField'
import { Toggle } from "./Toggle";

export function PasswordField(props) {
  const {
    value: incomingValue, accessor,
    onChange,
    ...passThrough
  } = useDefaultData(props)
  const [value, setValue] = useValueAccessor(incomingValue, accessor)
  const updateValue = useUpdate(onChange, setValue)

  const visibilityAccessor = useState(false)
  return (<TextField
    className="PasswordFieldRoot"
    label={defaultData.label}
    {...passThrough}
    value={value}
    onChange={updateValue}
    type={visibilityAccessor[0] ? "text" : defaultData.type}
    customAdornment={<Toggle accessor={visibilityAccessor} variant="visible" invert />}
  />);
}

export const defaultData = {
  label: "Password",
  type: "password",
  onChange() { },
}

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
