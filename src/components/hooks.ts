import { useRef } from 'react';

export const useNonNullableValue = <TValue>(value: TValue) => {
  const valueRef = useRef<TValue>(value);
  const previousValue = valueRef.current;

  if (value != null) {
    valueRef.current = value;
  }

  return [valueRef.current, previousValue] as const;
};
