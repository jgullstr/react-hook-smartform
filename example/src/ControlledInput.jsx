import React from 'react';
import { withFieldController } from 'react-hook-smartform';

const Input = props => {
  const { meta } = props;

  return (
    <div>
      <input {...props} />
      {JSON.stringify(meta, null, 2)}
    </div>
  );
};

export default withFieldController(Input, '');
