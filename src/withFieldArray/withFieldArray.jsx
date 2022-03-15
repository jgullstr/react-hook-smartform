import React from 'react';
import FieldArray from '../FieldArray';

const withFieldArray = Component => (props, params = {}) => {
  const { name } = props;

  return (
    <FieldArray name={name} {...params}>
      <Component {...props} />
    </FieldArray>
  );
};

export default withFieldArray;
