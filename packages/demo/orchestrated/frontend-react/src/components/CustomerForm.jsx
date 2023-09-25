import React from 'react';

import { ErrorMessage, Field, Form } from 'formik';

import Button from './Button';
import TextInput from './TextInput';
import ValidationLabel from './ValidationLabel';

const CustomerForm = ({ onCancel, isValid }) => {
  return (
    <Form>
      <div>
        <div className="my-4 flex">
          <label className="mr-4">
            Name
            <Field as={TextInput} name="name" autoFocus />
            <ErrorMessage name="name" component={ValidationLabel} />
          </label>
          <label>
            Location
            <Field as={TextInput} name="location" />
            <ErrorMessage name="location" component={ValidationLabel} />
          </label>
        </div>
        <div>
          <div>
            <Button submit kind="separate" text="Save" disabled={!isValid} />
            <Button onClick={onCancel} kind="separate" text="Cancel" />
          </div>
        </div>
      </div>
    </Form>
  );
};

export default React.memo(CustomerForm);
