import { Controller } from 'react-hook-form';
import React, { useContext, useMemo, forwardRef } from 'react';
import FormScopeContext from '../FormScopeContext';

const withFieldController = (Component, emptyValue) => ({ name: fieldName, ...props }) => {
  const {
    defaultValue: parentDefaultValue = {},
    getPath,
    getMetaData,
  } = useContext(FormScopeContext);

  const name = getPath(fieldName);

  const InjectedMetaComponent = useMemo(() => forwardRef((fieldProps, ref) => (
    <Component
      {...fieldProps}
      meta={getMetaData(fieldProps.name)}
      ref={ref}
    />
  )), [getMetaData]);

  return (
    <Controller
      {...props}
      as={InjectedMetaComponent}
      defaultValue={parentDefaultValue[fieldName] || emptyValue}
      name={name}
    />
  );
};

export default withFieldController;
