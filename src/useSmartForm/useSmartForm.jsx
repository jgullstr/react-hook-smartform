import React, {
  useEffect, useMemo, useRef, useCallback,
} from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import FormScopeContext from '../FormScopeContext';

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

  const Form = useCallback(({ children, ...props }) => (
    <FormProvider {...methodsRef.current}>
      <FormScopeContext.Provider
        value={{
          defaultValue: defaultValues,
          getPath: x => x,
        }}
      >
        <form {...props}>
          { children }
        </form>
      </FormScopeContext.Provider>
    </FormProvider>
  ), [defaultValues]);

  return useMemo(
    () => ({ ...methods, Form }),
    [methods, Form],
  );
};

export default useSmartForm;
