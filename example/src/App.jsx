import React, { useState } from 'react';

import {
  Form, Input, FormScope, useFieldArrayScope, FieldArray,
} from 'react-hook-smartform';

const Addresses = () => {
  const { renderFields, append, remove } = useFieldArrayScope();

  return (
    <div>
      Addresses:
      {renderFields(index => (
        <FormScope name={index}>
          <div>
            {`#${index + 1}`}
            <div>
              Street:
              <Input name="street" />
            </div>
            <div>
              City:
              <Input name="city" />
            </div>
            <button type="button" onClick={() => remove(index)}>
              Remove
            </button>
          </div>
        </FormScope>
      ))}
      <button type="button" onClick={() => append()}>Add row</button>
    </div>
  );
};

const App = () => {
  const [value, setValue] = useState();

  return (
    <div>
      <Form onSubmit={setValue}>
        <div>
          First name:
          <Input type="text" name="firstName" />
        </div>
        <div>
          Last name:
          <Input type="text" name="lastName" />
        </div>
        <FormScope name="address">
          <div>
            Addresses:
            <FieldArray name="addresses">
              <Addresses />
            </FieldArray>
          </div>

        </FormScope>
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
