import React from 'react';
import { Controller } from 'react-hook-form';
import useFormScope from '../useFormScope';

const HiddenControl = ({ field: { value, name, ref } }) => (
  <input
    type="hidden"
    name={name}
    value={value}
    ref={ref}
  />
);

const Hidden = ({ name: fieldName, unmountIfEmpty, ...other }) => {
  const { name, defaultValue = '' } = useFormScope(fieldName);

  return !unmountIfEmpty || defaultValue ? (
    <Controller
      name={name}
      defaultValue={defaultValue}
      render={HiddenControl}
      shouldUnregister
      {...other}
    />
  ) : null;
};

export default Hidden;
