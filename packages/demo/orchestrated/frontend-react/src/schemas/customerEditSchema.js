import * as yup from 'yup';

export default yup.object().shape({
  name: yup
    .string()
    .required('Customer name is required')
    .ensure()
    .label('Name'),
  location: yup.string().ensure().label('Location'),
});
