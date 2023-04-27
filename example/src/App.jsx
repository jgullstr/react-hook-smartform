import React, { useState, useEffect } from 'react';

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
  const {
    renderFields,
    append,
    remove,
    move,
  } = useFieldArrayScope();

  useEffect(() => {
    console.log('mount addresses');
    return () => console.log('unmount addresses');
  });

  return (
    <div>
      Addresses:
      {renderFields((index, last) => (
        <FormScope name={index}>
          <div>
            {`#${index + 1}`}
            <div>
              Streets:
              <Input name="street" />
            </div>
            <button type="button" onClick={() => remove(index)}>
              Remove
            </button>
            <button type="button" disabled={index === 0} onClick={() => move(index, index - 1)}>
              Up
            </button>
            <button type="button" disabled={index === last} onClick={() => move(index, index + 1)}>
              Down
            </button>
          </div>
        </FormScope>
      ))}
      <button type="button" onClick={() => append({ street: '', city: '' })}>Add row</button>
    </div>
  );
});

const value1 = {
  ards1: {
    addresses: [
      {
        street: 'b',
        city: '',
      },
      {
        street: '',
        city: '',
      },
      {
        street: 'g',
        city: '',
      },
    ],
  },
};

const value2 = {
  ards1: {
    addresses: [
      {
        street: 'sfdadsf',
      },
      {
        street: 'hfgfg',
      },
    ],
  },
};


const Unmounter = () => {
  useEffect(() => {
    return () => {
      console.log('form unmounted');
    }
  }, []);
  return null;
};


const App = () => {
  const [value, setValue] = useState({});

  const toggleValue = () => setValue(c => (c === value1 ? value2 : value1));

  return (
    <div>
      <Form
        onSubmit={setValue}
        hookParams={{ reValidateMode: 'onChange' }}
        defaultValue={value}
      >
        <Unmounter />
        <div>
          <Addresses name="ards1.addresses" />
        </div>
        <input type="submit" value="Submit" />
      </Form>
      Submitted value:
      <pre>
        {JSON.stringify(value, null, 2)}
      </pre>
      <button type="button" onClick={toggleValue}>Toggle</button>
    </div>
  );
};

export default App;
