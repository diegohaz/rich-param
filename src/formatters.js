import _ from 'lodash'

export const normalize = (normalize, value, param) => {
  if (normalize && !_.isNil(value)) {
    value = _.kebabCase(value).replace(/\-/g, ' ')
  }
  return value
}

export const lowercase = (lowercase, value, param) => {
  if (lowercase && _.isString(value)) {
    value = _.toLower(value)
  }
  return value
}

export const uppercase = (uppercase, value, param) => {
  if (uppercase && _.isString(value)) {
    value = _.toUpper(value)
  }
  return value
}

export const trim = (trim, value, param) => {
  if (trim && _.isString(value)) {
    value = _.trim(value)
  }
  return value
}
