import React from 'react';
import useSmartForm from '../useSmartForm';

const Form = ({
  onSubmit,
  children,
  defaultValue,
  hookParams = {},
  ...props
}) => {
  const { Form: SmartForm, ...methods } = useSmartForm({
    defaultValues: defaultValue,
    autoReset: true,
    ...hookParams,
  });
  const extendedOnSubmit = (value, e) => onSubmit(value, e, methods);

  const {
    handleSubmit,
  } = methods;

  return (
    <SmartForm onSubmit={handleSubmit(extendedOnSubmit)} {...props}>
      {children}
    </SmartForm>
  );
};

export default Form;
