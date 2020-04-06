import React, { useEffect, useMemo, useRef } from 'react';
import { useForm, FormContext } from 'react-hook-form';
import FormScopeContext from '../FormScopeContext';
import get from '../utils/get';

const Form = ({
  onSubmit,
  children,
  defaultValue,
  className,
  hookParams = {},
}) => {
  const methods = useForm(hookParams);
  const extendedOnSubmit = (value, e) => onSubmit(value, e, methods);

  const {
    handleSubmit, reset, errors, formState,
  } = methods;

  const getMetaDataRef = useRef();
  getMetaDataRef.current = path => ({
    errors: get(errors, path),
    dirty: formState.dirtyFields.has(path),
    touched: get(formState.touched, path, false),
  });

  useEffect(() => {
    reset(defaultValue);
  }, [defaultValue, reset]);

  const rootScope = useMemo(() => ({
    getMetaData: path => getMetaDataRef.current(path),
    getPath: x => x,
  }), []);

  const context = useMemo(() => ({
    defaultValue,
    ...rootScope,
    path: '',
  }), [defaultValue, rootScope]);

  return (
    <FormContext {...methods}>
      <FormScopeContext.Provider value={context}>
        <form onSubmit={handleSubmit(extendedOnSubmit)} className={className}>
          { children }
        </form>
      </FormScopeContext.Provider>
    </FormContext>
  );
};

export default Form;
