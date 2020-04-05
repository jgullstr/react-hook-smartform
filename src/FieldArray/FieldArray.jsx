import React, { useContext, useMemo } from 'react';
import { useFieldArray } from 'react-hook-form';
import FieldArrayContext from '../FieldArrayContext';
import FormScope from '../FormScope';
import FormScopeContext from '../FormScopeContext';

export const FIELD_ARRAY_KEY_NAME = Symbol('Array row identifier key');

const FieldArrayProvider = ({ flat, children }) => {
  const { name } = useContext(FormScopeContext);

  const methods = useFieldArray({
    name,
    keyName: FIELD_ARRAY_KEY_NAME,
  });

  const context = useMemo(() => ({ ...methods, flat }), [methods, flat]);

  return (
    <FieldArrayContext.Provider value={context}>
      {children}
    </FieldArrayContext.Provider>
  );
};

const FieldArray = ({ name, children, flat }) => (
  <FormScope name={name} type="array">
    <FieldArrayProvider flat={flat}>
      {children}
    </FieldArrayProvider>
  </FormScope>
);

export default FieldArray;
