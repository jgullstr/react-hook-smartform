import React from 'react';
import { useScopedController } from 'react-hook-smartform';

const Input = ({ name, rules, ...props }) => {
  const { field, fieldState } = useScopedController({
    name,
    defaultValue: '',
    rules,
  });

  const {
    error,
    isDirty,
    isTouched,
    invalid,
  } = fieldState;

  return (
    <div>
      <input {...props} {...field} />
      {JSON.stringify({ isDirty, isTouched, invalid, error: invalid && error.message }, null, 2)}
    </div>
  );
};

export default Input;
