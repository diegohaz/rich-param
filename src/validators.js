import _ from 'lodash'

export const required = (required, value, param) => ({
  valid: !required || !_.isNil(value) && !_.isNaN(value) && value !== '',
  message: `${param.name} is required`
})

export const min = (min, value, param) => ({
  valid: _.isNil(value) || value >= min,
  message: `${param.name} must be greater than or equal to ${min}`
})

export const max = (max, value, param) => ({
  valid: _.isNil(value) || value <= max,
  message: `${param.name} must be lower than or equal to ${max}`
})

export const minlength = (minlength, value, param) => {
  let valid = true
  if (_.isNumber(minlength) && !_.isNil(value)) {
    if (param.option('multiple')) {
      value = _.isArray(param.value()) ? param.value() : [param.value()]
    }
    valid = value.length >= minlength
  }
  return {
    valid,
    message: `${param.name} must have length greater than or equal to ${minlength}`
  }
}

export const maxlength = (maxlength, value, param) => {
  let valid = true
  if (_.isNumber(maxlength) && !_.isNil(value)) {
    if (param.option('multiple')) {
      value = _.isArray(param.value()) ? param.value() : [param.value()]
    }
    valid = value.length <= maxlength
  }
  return {
    valid,
    message: `${param.name} must have length lower than or equal to ${maxlength}`
  }
}

export const enumerator = (enumerator, value, param) => ({
  valid: !_.isArray(enumerator) || _.isNil(value) || ~enumerator.indexOf(value),
  message: `${param.name} must be one of: ${enumerator.join(', ')}`
})

export const match = (match, value, param) => ({
  valid: !_.isRegExp(match) || _.isNil(value) || match.test(value),
  message: `${param.name} must match regular expression ${match}`
})
