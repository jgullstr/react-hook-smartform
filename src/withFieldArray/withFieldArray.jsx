import React from 'react';
import FieldArray from '../FieldArray';

const withFieldArray = Component => props => {
  const { name } = props;

  return (
    <FieldArray name={name}>
      <Component {...props} />
    </FieldArray>
  );
};

export default withFieldArray;
