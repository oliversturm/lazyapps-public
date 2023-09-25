import { writable, derived } from 'svelte/store';

const validField = {};

const getErrors = ({ inner }) =>
  inner.reduce((r, v) => {
    return { ...r, [v.path]: v.message };
  }, {});

const validate = (schema, errors) => data =>
  schema
    .validate(data, { abortEarly: false })
    .then(() => {
      errors.set({ [validField]: true });
    })
    .catch(e => {
      errors.set({ ...getErrors(e), [validField]: false });
    });

export const createValidator = schema => {
  // writable for easy access in the validate function
  const errors = writable({ [validField]: true });

  return {
    validate: validate(schema, errors),
    // Not writable from the outside
    errors: derived(errors, x => x),
    isValid: derived(errors, e => e[validField]),
  };
};
