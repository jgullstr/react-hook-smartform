import React, { useEffect, useMemo, useRef } from 'react';
import { useForm, FormContext } from 'react-hook-form';
import FormScopeContext from '../FormScopeContext';

const Form = ({
  onSubmit,
  children,
  defaultValue,
  className,
  hookParams = {},
}) => {
  const methods = useForm(hookParams);
  const extendedOnSubmit = (value, e) => onSubmit(value, e, methods);

  const { handleSubmit, reset, errors } = methods;
  const defaultValueRef = useRef();
  const errorsRef = useRef();
  errorsRef.current = errors;
  defaultValueRef.current = defaultValue;

  useEffect(() => {
    reset(defaultValue);
  }, [defaultValue, reset]);


  const scope = useMemo(() => ({ defaultValueRef, errorsRef }), []);

  return (
    <FormContext {...methods}>
      <FormScopeContext.Provider value={scope}>
        <form onSubmit={handleSubmit(extendedOnSubmit)} className={className}>
          { children }
        </form>
      </FormScopeContext.Provider>
    </FormContext>
  );
};

export default Form;
