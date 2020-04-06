import React, { useContext, useMemo } from 'react';
import FormScopeContext from '../FormScopeContext';

const getScopedPath = (path, type = 'object') => name => {
  switch (type) {
    case 'object':
      return `${path}.${name}`;
    case 'array':
      return `${path}[${name}]`;
    default:
      throw new TypeError(`Unknown composed field type: ${type}`);
  }
};

const FormScope = ({ name, children, type }) => {
  const {
    defaultValue,
    getMetaData,
    getPath,
  } = useContext(FormScopeContext);

  const context = useMemo(() => {
    const path = getPath(name, type);

    return {
      defaultValue,
      type,
      getMetaData,
      getPath: getScopedPath(path, type),
      path,
    };
  }, [defaultValue, getMetaData, name, type, getPath]);

  return (
    <FormScopeContext.Provider value={context}>
      { children }
    </FormScopeContext.Provider>
  );
};

export default FormScope;
