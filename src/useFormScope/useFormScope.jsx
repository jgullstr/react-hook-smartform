import { useContext } from 'react';
import FormScopeContext from '../FormScopeContext';

const useFormScope = name => {
  const {
    defaultValue: parentDefaultValue,
    getPath,
  } = useContext(FormScopeContext);

  const path = getPath(name);

  return {
    name: path,
    defaultValue: (parentDefaultValue || {})[name],
  };
};

export default useFormScope;
