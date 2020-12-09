import * as yup from 'yup';
import { get } from 'config';

const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .email('Please enter a valid email')
    .required('Email is required'),
});

const resetPasswordSchema = yup.object().shape({
  password: yup
    .string()
    .trim()
    .matches(
      new RegExp(get('regex.passwordRegex')),
      'Password should be 8-20 characters long and only have letters, digits and symbols like @,*,# and _'
    )
    .required('Password is required'),
});

export { forgotPasswordSchema, resetPasswordSchema };
