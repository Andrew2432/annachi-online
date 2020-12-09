import * as yup from 'yup';

const deleteFileSchema = yup.object().shape({
  id: yup
    .string()
    .trim()
    .matches(
      new RegExp(
        '^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$',
        'i'
      ),
      'Invalid Id'
    )
    .required('ID is required'),
});

export default deleteFileSchema;
