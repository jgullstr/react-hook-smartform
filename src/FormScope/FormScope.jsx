import React, { useContext, useMemo } from 'react';
import FormScopeContext from '../FormScopeContext';
import getScopedPath from '../utils/getScopedPath';

const FormScope = ({ name, children, type }) => {
  const {
    defaultValue,
    getMetaData,
    getPath,
  } = useContext(FormScopeContext);

  const context = useMemo(() => {
    const path = getPath(name, type);
    return {
      defaultValue: (defaultValue || {})[name],
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
