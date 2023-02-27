import React, { useMemo } from "react";
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { useValueAccessor } from "./hooks";
import { IconButton, Switch, ToggleButton } from "@mui/material";
import { xor } from "./util";

export function Toggle(props) {
  const {
    value: incomingValue, accessor,
    variant, invert,
    onChange,
    ...passThrough
  } = useDefaultData(props)
  const [value, setValue] = useValueAccessor(incomingValue, accessor)
  const toggleValue = useMemo(
    () => xor(value, invert),
    [value, invert],
  );

  const ToggleType = useToggleType(variant)

  return (<div className="ToggleRoot">
    <ToggleType
      {...passThrough}
      value={toggleValue}
      onChange={() => {
        setValue(!value)
        onChange(!value)
      }}
    />
  </div>);
}

export const defaultData = {
  variant: "switch",
  invert: false,
  onChange() { },
}

function useDefaultData(props) {
  return useMemo(
    () => ({
      ...defaultData,
      ...props,
    }),
    [props],
  );
}
function useToggleType(variant) {
  return useMemo(
    () => {
      switch (variant) {
        case 'switch':
          return SwitchType
        case 'check':
          return CheckType
        case 'visible':
          return VisibleType
        default:
          return null
      }
    },
    [variant],
  );
}

function SwitchType({ value, onChange }) {
  return (<Switch onChange={onChange} checked={value} />)
}
function VisibleType({ value, onChange }) {
  return (<div onClick={onChange}>
    <IconButton>
      {value ? <VisibilityIcon /> : <VisibilityOffIcon />}
    </IconButton>
  </div>)
}

function CheckType({ value, onChange }) {
  return <ToggleButton
    value="check"
    selected={value}
    onChange={onChange}
  >
    <CheckIcon />
  </ToggleButton>
}