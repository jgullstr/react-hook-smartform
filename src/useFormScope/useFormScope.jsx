import React, {
  useContext, useRef, useCallback,
} from 'react';
import FormScopeContext from '../FormScopeContext';

const useFormScope = (fieldName, type = 'object') => {
  const {
    name: parentName,
    defaultValueRef: parentDefaultValueRef,
    type: parentType,
    errorsRef: parentErrorsRef,
  } = useContext(FormScopeContext);

  const defaultValueRef = useRef();
  const errorsRef = useRef();

  const getScopedName = () => {
    switch (parentType) {
      case 'object':
        return `${parentName}.${fieldName}`;
      case 'array':
        return `${parentName}[${fieldName}]`;
      default:
        throw new TypeError(`Unknown composed field type: ${parentType}`);
    }
  };

  const name = parentName ? getScopedName() : fieldName;
  const errors = (parentErrorsRef.current || {})[fieldName];
  errorsRef.current = errors;
  const defaultValue = (parentDefaultValueRef.current || {})[fieldName];
  defaultValueRef.current = defaultValue;

  const FormScopeProvider = useCallback(({ children }) => (
    <FormScopeContext.Provider
      value={{
        name, defaultValueRef, errorsRef, type,
      }}
    >
      { children }
    </FormScopeContext.Provider>
  ), [name, type]);

  return {
    name,
    errors,
    defaultValue,
    FormScopeProvider,
  };
};

export default useFormScope;
