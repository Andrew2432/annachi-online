import * as yup from 'yup';
import { get } from 'config';

const schema = yup.object().shape({
  username: yup
    .string()
    .trim()
    .matches(
      new RegExp(get('regex.usernameRegex')),
      'Username should only have letters and numbers and have 2-20 characters'
    )
    .required('Username is required'),
  email: yup
    .string()
    .trim()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .trim()
    .matches(
      new RegExp(get('regex.passwordRegex')),
      'Password should contain 8-20 characters. Only letters, digits and symbols @,*,# and _ are allowed'
    )
    .required('Password is required'),
});

export default schema;
