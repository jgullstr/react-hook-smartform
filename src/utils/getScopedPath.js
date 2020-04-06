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

export default getScopedPath;
