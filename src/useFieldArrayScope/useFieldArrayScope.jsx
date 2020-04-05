import React, {
  Fragment, useContext, useMemo, useRef,
} from 'react';
import FieldArrayContext from '../FieldArrayContext';
import FormScopeContext from '../FormScopeContext';
import { FIELD_ARRAY_KEY_NAME } from '../FieldArray/FieldArray';

const useFieldArrayScope = () => {
  const methods = useContext(FieldArrayContext);
  const fieldKeysRef = useRef();
  const { defaultValueRef } = useContext(FormScopeContext);
  const { fields, flat } = methods;

  // HACK: Resolve values for non-object fields.
  // @see https://github.com/react-hook-form/react-hook-form/issues/1344
  fieldKeysRef.current = fields.map(({ [FIELD_ARRAY_KEY_NAME]: key }) => key);
  defaultValueRef.current = flat ? fields.map(({ value }) => value) : fields;

  return useMemo(() => {
    const renderFields = fn => fieldKeysRef.current.map((key, index) => (
      <Fragment key={key}>
        {fn(index)}
      </Fragment>
    ));

    return { ...methods, renderFields };
  }, [methods]);
};

export default useFieldArrayScope;
