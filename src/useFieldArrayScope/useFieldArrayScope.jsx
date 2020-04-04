import React, { Fragment, useContext, useMemo } from 'react';
import FieldArrayContext from '../FieldArrayContext';
import FormScopeContext from '../FormScopeContext';
import { FIELD_ARRAY_KEY_NAME } from '../FieldArray/FieldArray';

const useFieldArrayScope = () => {
  const methods = useContext(FieldArrayContext);
  const { defaultValueRef } = useContext(FormScopeContext);
  const { fields } = methods;
  defaultValueRef.current = fields;

  return useMemo(() => {
    const renderFields = fn => defaultValueRef.current.map((item, index) => (
      <Fragment key={item[FIELD_ARRAY_KEY_NAME]}>
        {fn(index)}
      </Fragment>
    ));

    return { ...methods, renderFields };
  }, [methods, defaultValueRef]);
};

export default useFieldArrayScope;
