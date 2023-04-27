import React, {
  useEffect, useMemo, useRef, useCallback,
} from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import FormScopeContext from '../FormScopeContext';

const useSmartForm = ({ autoReset, defaultValues, ...params }) => {
  const methods = useForm(params);
  const { reset } = methods;
  const shouldReset = useRef(true);
  const formDataRef = useRef();
  formDataRef.current = { methods, defaultValues };

  useEffect(() => {
    if (shouldReset.current) {
      reset(defaultValues);
      shouldReset.current = autoReset;
    }
  }, [defaultValues, reset, autoReset]);

  const Form = useCallback(({ children, onSubmit, ...props }) => {
    const { current: formData } = formDataRef;

    return (
      <FormProvider {...formData.methods} submit={onSubmit}>
        <FormScopeContext.Provider
          value={{
            defaultValue: formData.defaultValues,
            getPath: x => x,
          }}
        >
          <form {...props} onSubmit={onSubmit}>
            { children }
          </form>
        </FormScopeContext.Provider>
      </FormProvider>
    );
  }, []);

  return useMemo(
    () => ({ ...methods, Form }),
    [methods, Form],
  );
};

export default useSmartForm;
