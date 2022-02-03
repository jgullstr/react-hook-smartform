import React, { useContext, useMemo, Fragment } from 'react';
import { useFieldArray } from 'react-hook-form';
import FieldArrayContext from '../FieldArrayContext';
import FormScope from '../FormScope';
import FormScopeContext from '../FormScopeContext';

// Use unique Symbol as key to prevent conflicts.
// @see https://github.com/react-hook-form/react-hook-form/issues/1344
const KEY_NAME = Symbol('FieldArray row identifier');

const FieldArrayProvider = ({ children }) => {
  const parentContext = useContext(FormScopeContext);
  const { path } = parentContext;

  const methods = useFieldArray({
    name: path,
    keyName: KEY_NAME,
  });

  const { fields } = methods;

  const arrayContext = useMemo(() => {
    const renderFields = fn => {
      const lastIndex = fields.length - 1;

      return fields.map(({ [KEY_NAME]: key }, index) => (
        <Fragment key={key}>
          {fn(index, lastIndex)}
        </Fragment>
      ));
    };

    return { ...methods, renderFields, keyName: KEY_NAME };
  }, [methods, fields]);

  // Replace defaultValue with field values from useFieldArray.
  const scopeContext = useMemo(() => ({
    ...parentContext,
    // HACK: Resolve values for non-object fields.
    // @see https://github.com/react-hook-form/react-hook-form/issues/1344
    defaultValue: fields,
  }), [fields, parentContext]);

  return (
    <FormScopeContext.Provider value={scopeContext}>
      <FieldArrayContext.Provider value={arrayContext}>
        {children}
      </FieldArrayContext.Provider>
    </FormScopeContext.Provider>
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
