import { useContext } from 'react';
import { useController } from 'react-hook-form';
import FormScopeContext from '../FormScopeContext';

const emptyObject = {};

const useScopedController = ({
  name: fieldName,
  defaultValue: fieldDefaultValue = '',
  emptyValue = '',
  ...props
}) => {
  const {
    defaultValue: parentDefaultValue = emptyObject,
    getPath,
  } = useContext(FormScopeContext);

  const name = getPath(fieldName);

  // Form default value takes precedence over default value provided to field.
  // Controller defaultValue is required for fields to work as expected in field arrays.
  const defaultValue = Object.prototype.hasOwnProperty.call(parentDefaultValue, fieldName)
    ? parentDefaultValue[fieldName]
    : fieldDefaultValue;

  // When form is reset with missing field value, controller returns undefined. Fall back to
  // emptyValue if controller to prevent mixing up controlled/uncontrolled component states.
  const { field, ...other } = useController({
    name,
    defaultValue,
    ...props,
  });

  const value = field.value === undefined
    ? emptyValue
    : field.value;

  return {
    field: {
      ...field,
      value,
    },
    ...other,
  };
};

export default useScopedController;
