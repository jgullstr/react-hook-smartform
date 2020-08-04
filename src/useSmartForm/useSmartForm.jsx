import React, {
  useEffect, useMemo, useRef, useCallback,
} from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import FormScopeContext from '../FormScopeContext';
import get from '../utils/get';

const useSmartForm = ({ autoReset, defaultValues, ...params }) => {
  const methods = useForm(params);
  const { reset } = methods;
  const shouldReset = useRef(true);
  const methodsRef = useRef();
  methodsRef.current = methods;

  useEffect(() => {
    if (shouldReset.current) {
      reset(defaultValues);
      shouldReset.current = autoReset;
    }
  }, [defaultValues, reset, autoReset]);

  const {
    errors, formState,
  } = methods;

  const getMetaDataRef = useRef();
  getMetaDataRef.current = path => ({
    errors: get(errors, path),
    isDirty: get(formState.dirtyFields, path),
    touched: get(formState.touched, path, false),
  });

  const rootScope = useMemo(() => ({
    getMetaData: path => getMetaDataRef.current(path),
    getPath: x => x,
  }), []);

  const context = useMemo(() => ({
    defaultValue: defaultValues,
    ...rootScope,
  }), [defaultValues, rootScope]);

  const Form = useCallback(({ children, ...props }) => (
    <FormProvider {...methodsRef.current}>
      <FormScopeContext.Provider value={context}>
        <form {...props}>
          { children }
        </form>
      </FormScopeContext.Provider>
    </FormProvider>
  ), [context]);

  return useMemo(
    () => ({ ...methods, Form }),
    [methods, Form],
  );
};

export default useSmartForm;
