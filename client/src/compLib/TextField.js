import React, { useMemo } from "react";
import {
  TextField as MUITextField,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { useIsDisabled, useIsValid, useValueAccessor } from "./hooks"

export function TextField(props) {
  const {
    value: incomingValue, accessor,
    helperText,
    error, loading, disabled,
    onChange,
    fullHeight,
    customAdornment,
    ...passthrough
  } = useDefaultData(props)

  const [value, setValue] = useValueAccessor(incomingValue, accessor)
  const isValid = useIsValid(error)
  const isDisabled = useIsDisabled(loading, disabled)

  const subText = useMemo(
    () => helperText || (typeof error === 'string' && error) || (fullHeight ? " " : ""),
    [helperText, error, fullHeight],
  );

  return (<MUITextField
    className="TextFieldRoot"
    InputProps={{
      endAdornment: (
        <InputAdornment position="end">
          {loading ? <CircularProgress /> : customAdornment}
        </InputAdornment>
      ),
    }}

    type={defaultData.type}
    {...passthrough}
    value={value}
    variant="outlined"
    margin="dense"
    error={!isValid}
    helperText={subText}
    disabled={isDisabled}
    onChange={(e) => {
      setValue(e.target.value)
      onChange(e.target.value)
    }}
  />);
}

export const defaultData = {
  label: "",
  color: "primary",
  placeholder: "",
  helperText: "",
  type: "text",

  error: false,
  loading: false,
  required: false,
  disabled: false,

  fullWidth: false,
  fullHeight: false,

  customAdornment: null,

  onChange() { },
  onKeyUp() { },
  onFocus() { },
  onBlur() { },
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
