import React from 'react';
import { useFormContext } from 'react-hook-form';
import useFormScope from '../useFormScope';

const FormScope = ({ name, children, type }) => {
  const { FormScopeProvider } = useFormScope(name, type);

  // HACK: force render so errors can propagate.
  useFormContext();

  return (
    <FormScopeProvider>
      { children }
    </FormScopeProvider>
  );
};

export default FormScope;
