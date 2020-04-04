import React, { useState } from 'react';

import { Form, Input } from 'react-hook-smartform';
import 'react-hook-smartform/dist/index.css';

const App = () => {
  const [value, setValue] = useState();

  return (
    <div>
      <Form onSubmit={setValue}>
        <Input type="text" name="name" />
        <input type="submit" value="Submit" />
      </Form>
      Submitted value:
      <pre>
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
};

export default App;
