/**
 * Blatantly stolen from react-hook-form
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/utils/get.ts
 */

const isUndefined = val => val === undefined;

const isNullOrUndefined = val => val === null || isUndefined(val);

export default (obj, path, defaultValue) => {
  const result = path
    .split(/[,[\].]+?/)
    .filter(Boolean)
    .reduce(
      (carry, key) => (isNullOrUndefined(carry) ? carry : carry[key]),
      obj,
    );
  return isUndefined(result) || result === obj
    ? obj[path] || defaultValue
    : result;
};
