function formatValidationErrors(errors) {
  return errors.map(err => ({
    field: err.param,
    message: err.msg
  }));
}

module.exports = formatValidationErrors;