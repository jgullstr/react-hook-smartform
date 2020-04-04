import React from 'react';
import { Controller } from 'react-hook-form';
import useFormScope from '../useFormScope';

const HiddenControl = ({ value, name }) => (
  <input
    type="hidden"
    name={name}
    value={value}
  />
);

const Hidden = ({ name: fieldName, unmountIfEmpty, ...other }) => {
  const { name, defaultValue } = useFormScope(fieldName);

  return !unmountIfEmpty || defaultValue ? (
    <Controller
      name={name}
      defaultValue={defaultValue}
      as={HiddenControl}
      {...other}
    />
  ) : null;
};

export default Hidden;
