import { Controller } from 'react-hook-form';
import React, { useContext, useCallback } from 'react';
import FormScopeContext from '../FormScopeContext';

const withFieldController = (Component, emptyValue) => ({ name: fieldName, ...props }) => {
  const {
    defaultValue: parentDefaultValue = {},
    getPath,
    getMetaData,
  } = useContext(FormScopeContext);

  const name = getPath(fieldName);

  const InjectedMetaComponent = useCallback(fieldProps => (
    <Component
      {...fieldProps}
      meta={getMetaData(fieldProps.name)}
    />
  ), [getMetaData]);

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
