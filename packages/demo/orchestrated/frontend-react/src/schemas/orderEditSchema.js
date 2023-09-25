import * as yup from 'yup';

export default yup.object().shape({
  text: yup.string().required('Item text is required').ensure().label('Text'),
  // Note that yup does not do undefined handling - like
  // it does for strings when you use `ensure()` - for numbers.
  // This can result in React errors about changing an
  // uncontrolled to a controlled value. When working with
  // number fields, it is therefore important to set
  // their initial values - the schema won't do this
  // automatically. You can see this happen in two places
  // (to be safe) in `OrderView.jsx`.
  value: yup.number().positive('Value must be positive').label('Value'),
});
