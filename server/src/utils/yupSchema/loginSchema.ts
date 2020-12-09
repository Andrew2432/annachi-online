import * as yup from 'yup';
import { get } from 'config';

//  For username and password
const usernameSchema = yup.object().shape({
  username: yup
    .string()
    .trim()
    .matches(
      new RegExp(get('regex.usernameRegex')),
      'Username contains invalid characters'
    )
    .required('Username is required'),
  password: yup
    .string()
    .trim()
    .matches(
      new RegExp(get('regex.passwordRegex')),
      'Password contains invalid characters'
    )
    .required('Password is required'),
});

//  For email and password
const emailSchema = yup.object().shape({
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
      'Password contains invalid characters'
    )
    .required('Password is required'),
});

export { usernameSchema, emailSchema };
