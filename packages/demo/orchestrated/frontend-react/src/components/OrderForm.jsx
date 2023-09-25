import React from 'react';

import { ErrorMessage, Field, Form } from 'formik';

import Button from './Button';
import TextInput from './TextInput';
import ValidationLabel from './ValidationLabel';

const OrderForm = ({ onCancel, isValid }) => {
  return (
    <Form>
      <div>
        <div className="my-4 flex">
          <label className="mr-4">
            Text
            <Field as={TextInput} name="text" autoFocus />
            <ErrorMessage name="text" component={ValidationLabel} />
          </label>
          <label>
            Value
            <Field as={TextInput} name="value" />
            <ErrorMessage name="value" component={ValidationLabel} />
          </label>
        </div>
        <div>
          <div>
            <Button submit kind="separate" text="Save" disabled={!isValid} />
            <Button kind="separate" onClick={onCancel} text="Cancel" />
          </div>
        </div>
      </div>
    </Form>
  );
};

export default React.memo(OrderForm);
