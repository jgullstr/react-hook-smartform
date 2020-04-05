import React from 'react';
import FieldArray from '../FieldArray';

const withFieldArray = Component => props => {
  const { name, flat } = props;

  return (
    <FieldArray name={name} flat={flat}>
      <Component {...props} />
    </FieldArray>
  );
};

export default withFieldArray;
