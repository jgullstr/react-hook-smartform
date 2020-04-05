import React, { useContext } from 'react';
import { useFieldArray } from 'react-hook-form';
import FieldArrayContext from '../FieldArrayContext';
import FormScope from '../FormScope';
import FormScopeContext from '../FormScopeContext';

export const FIELD_ARRAY_KEY_NAME = Symbol('Array row identifier key');

const FieldArrayProvider = ({ children }) => {
  const { name } = useContext(FormScopeContext);

  const methods = useFieldArray({
    name,
    keyName: FIELD_ARRAY_KEY_NAME,
  });

  return (
    <FieldArrayContext.Provider value={methods}>
      {children}
    </FieldArrayContext.Provider>
  );
};

const FieldArray = ({ name, children }) => (
  <FormScope name={name} type="array">
    <FieldArrayProvider>
      {children}
    </FieldArrayProvider>
  </FormScope>
);

export default FieldArray;
