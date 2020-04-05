import React, {
  useContext, useRef, useCallback,
} from 'react';
import FormScopeContext from '../FormScopeContext';

const useFormScope = (fieldName, type = 'object') => {
  const {
    name: parentName,
    defaultValueRef: parentDefaultValueRef,
    type: parentType,
    getMetaData,
  } = useContext(FormScopeContext);

  const defaultValueRef = useRef();

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
  const defaultValue = (parentDefaultValueRef.current || {})[fieldName];
  defaultValueRef.current = defaultValue;

  const FormScopeProvider = useCallback(({ children }) => (
    <FormScopeContext.Provider
      value={{
        name, defaultValueRef, type, getMetaData,
      }}
    >
      { children }
    </FormScopeContext.Provider>
  ), [name, type, getMetaData]);

  return {
    name,
    defaultValue,
    FormScopeProvider,
    ...getMetaData(name),
  };
};

export default useFormScope;
