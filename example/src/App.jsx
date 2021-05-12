import React, { useState } from 'react';

import {
  Form, FormScope, Hidden, useFieldArrayScope, withFieldArray,
} from 'react-hook-smartform';
import Input from './ControlledInput';

const Names = withFieldArray(() => {
  const { renderFields, append, remove } = useFieldArrayScope();

  return (
    <div>
      Names:
      {renderFields(index => (
        <div>
          <Input name={index} rules={{ required: 'NEAAAMEE!' }} />
          <button type="button" onClick={() => remove(index)}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={() => append('')}>Add row</button>
    </div>
  );
});

const Addresses = withFieldArray(() => {
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
              <Input name="city" rules={{ required: 'CITY REQUIRED' }} />
            </div>
            <div>
              Names:
              <Names name="names" flat />
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
});

const App = () => {
  const [value, setValue] = useState({ id: 4 });

  return (
    <div>
      <Form onSubmit={setValue} hookParams={{ reValidateMode: 'onChange' }}>
        <Hidden name="id" unmountIfEmpty />
        <div>
          First name:
          <Input type="text" name="firstName" rules={{ required: 'reqiueerded' }} />
        </div>
        <div>
          Mid name:
          <Input type="text" name="midName" rules={{ required: 'reqiueerded' }} />
        </div>
        <div>
          Last name:
          <Input type="text" name="lastName" />
        </div>
        <div>
          Addresses:
          <FormScope name="ards">
            <Addresses name="addresses" />
          </FormScope>
        </div>
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
