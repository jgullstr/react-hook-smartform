import React from 'react';
import useFormScope from '../useFormScope';

const FormScope = ({ name, children, type }) => {
  const { FormScopeProvider } = useFormScope(name, type);

  return (
    <FormScopeProvider>
      { children }
    </FormScopeProvider>
  );
};

export default FormScope;
