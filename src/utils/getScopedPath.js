const getScopedPath = (path, type = 'object') => name => {
  if (type === 'object' && Number.isInteger(Number(name))) {
    throw new TypeError(`${path}: Numeric field names are not supported`);
  }
  return `${path}.${name}`;
}

export default getScopedPath;
