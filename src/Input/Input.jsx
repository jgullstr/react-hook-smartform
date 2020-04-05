import React, { Fragment } from 'react';
import { useFormContext } from 'react-hook-form';
import useFormScope from '../useFormScope';

const Input = ({
  rules,
  name: fieldName,
  displayErrors = true,
  errorClassName = 'error',
  ...props
}) => {
  const { name, defaultValue, errors } = useFormScope(fieldName);
  const { register } = useFormContext();
  const errorMessage = errors && (errors.message || errors.type);

  return (
    <Fragment>
      <input
        {...props}
        name={name}
        ref={register(rules)}
        defaultValue={defaultValue || ''}
      />
      {displayErrors && errorMessage
        ? <span className={errorClassName}>{errorMessage}</span>
        : null}
    </Fragment>
  );
};

export default Input;
