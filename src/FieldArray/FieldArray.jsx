import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import FieldArrayContext from '../FieldArrayContext';
import FormScope from '../FormScope';

export const FIELD_ARRAY_KEY_NAME = 'rowKey';

const FieldArray = ({ name, children }) => {
  const { control } = useFormContext();

  const methods = useFieldArray({
    control,
    name,
    keyName: FIELD_ARRAY_KEY_NAME,
  });

  return (
    <FormScope name={name} type="array">
      <FieldArrayContext.Provider value={methods}>
        {children}
      </FieldArrayContext.Provider>
    </FormScope>
  );
};

export default FieldArray;
