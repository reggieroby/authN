import { useCallback, useEffect, useMemo, useState } from "react";

export function useValueAccessor(value, accessor) {
  const getValue = useMemo(
    () => {
      let retValue;
      if (value !== undefined) {
        retValue = value
      } else if (accessor !== undefined) {
        ([retValue] = accessor)
      }
      return retValue
    },
    [value, accessor],
  );
  const setValue = useCallback(
    (v) => accessor?.[1](v),
    [accessor],
  );

  return [getValue, setValue]
}

export function useIsDisabled(loading, disabled) {
  return useMemo(
    () => loading || disabled,
    [disabled, loading],
  );
}

export function useIsValid(error) {
  return useMemo(
    () => (typeof error === 'string' && error.length === 0) || !error,
    [error],
  );
}

export function useUpdate(onChange, setValue) {
  return useCallback((v) => {
    setValue(v)
    onChange(v)
  }, [onChange, setValue])
}

export function useOneWay(args, defaultValue) {
  const [value, setValue] = useState(defaultValue);
  useEffect(
    () => { args.value !== undefined && setValue(args.value) },
    [args.value],
  );
  return useMemo(() => ({
    ...args,
    value,
    onChange: (newValue) => setValue(newValue)
  }),
    [args, value],
  )
}

export function useTwoWay({ value, ...args }, defaultValue) {
  const accessor = useState(defaultValue);
  useEffect(
    () => { value !== undefined && accessor[1](value) },
    [value, accessor],
  );
  return useMemo(() => ({
    ...args,
    accessor,
  }),
    [args, accessor]
  )
}