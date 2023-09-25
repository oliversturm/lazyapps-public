import * as yup from 'yup';

export default yup.object().shape({
  text: yup.string().required('Item text is required').ensure().label('Text'),
  value: yup.number().positive('Value must be positive').label('Value'),
});
