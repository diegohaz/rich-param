import _ from 'lodash'
import * as validators from './validators'
import * as formatters from './formatters'

/** Param class. */
export default class Param {

  /**
   * Create a param.
   * @param {string} name - Param name.
   * @param {*} [value] - The value of the param.
   * @param {Object} [options] - Options of the param.
   */
  constructor (name, value, options = {}) {
    this.name = name
    this.handlers = {
      formatters: {},
      validators: {}
    }
    this.options = _.assign({
      multiple: false,
      trim: true,
      separator: ',',
      format: (value, param) => value,
      validate: (value, param) => ({ valid: true })
    }, options)

    if (_.isNil(this.options.type)) {
      this.options.type = this._getType(value)
    }

    if (_.isArray(this.options.type)) {
      this.options.multiple = true
      this.options.type = this.options.type[0]
    }

    this.formatter('default', (defaultValue, value, param) => {
      if (_.isNil(value) || _.isNaN(value) || value === '') {
        value = _.isFunction(defaultValue) ? defaultValue(this) : defaultValue
        if (_.isNil(options.type)) {
          param.option('type', this._getType(value))
        }
      }
      return value
    })

    this.formatter('normalize', formatters.normalize)
    this.formatter('lowercase', formatters.lowercase)
    this.formatter('uppercase', formatters.uppercase)
    this.formatter('trim', formatters.trim)

    this.validator('required', validators.required)
    this.validator('min', validators.min)
    this.validator('max', validators.max)
    this.validator('minlength', validators.minlength)
    this.validator('maxlength', validators.maxlength)
    this.validator('enum', validators.enumerator)
    this.validator('match', validators.match)

    this.value(value)
  }

  /**
   * Get or set an option.
   * @param {string} name - Option name.
   * @param {*} [value] - Set the value of the option.
   * @return {*} Value of the option.
   */
  option (name, value) {
    if (arguments.length > 1) {
      this.options[name] = value
    }

    return this.options[name]
  }

  /**
   * Get or set a handler.
   * @param {string} type - Handler type.
   * @param {string} name - Handler name.
   * @param {Function} [fn] - Set the handler method.
   */
  handler (type, name, fn) {
    if (arguments.length > 2) {
      this.handlers[type][name] = fn
    }

    return this.handlers[type][name]
  }

  /**
   * Get or set a formatter.
   * @param {string} name - Formatter name.
   * @param {formatterFn} [fn] - Set the formatter method.
   * @return {formatterFn} The formatter method.
   */
  formatter (name, fn) {
    return this.handler('formatters', ...arguments)
  }

  /**
   * Get or set a validator.
   * @param {string} name - Validator name.
   * @param {validatorFn} [fn] - Set the validator method.
   * @return {validatorFn} The validator method.
   */
  validator (name, fn) {
    return this.handler('validators', ...arguments)
  }

  /**
   * Get or set the param value.
   * @param {*} [value] - Set the param value.
   * @param {boolean} [bind=true] - Set if value must be bound to parameter or not.
   * @return {*} The formatted value.
   */
  value (value, bind = true) {
    const options = this.options

    if (arguments.length === 0) {
      return this._value
    }

    if (options.multiple) {
      let values = value

      if (_.isString(value) && ~value.search(options.separator)) {
        values = value.split(options.separator)
      }

      if (_.isArray(values)) {
        values = values.map((value) => this.value(value, false))

        if (bind) {
          this._value = values
        }

        return values
      }
    }

    _.forIn(this.options, (optionValue, option) => {
      let formatter = this.handlers.formatters[option]
      if (_.isFunction(formatter)) {
        value = formatter(optionValue, value, this)
      }
    })

    if (!_.isNil(value)) {
      if (options.type.name === 'RegExp') {
        value = new RegExp(value, 'i')
      } else if (options.type.name === 'Date') {
        value = new Date(/^\d{5,}$/.test(value) ? Number(value) : value)
      } else if (options.type.name === 'Boolean') {
        value = !(value === 'false' || value === '0' || !value)
      } else if (options.type.name === 'String' || options.type.name === 'Number') {
        value = options.type(value)
      } else {
        const Type = options.type
        value = new Type(value)
      }
    }

    value = options.format(value, this)

    if (bind) {
      this._value = value
    }

    return value
  }

  /**
   * Validates the param.
   * @param {*} [value] - Set the param value.
   * @param {Function} [next] - Callback to be called with error
   * @return {boolean} Result of the validation.
   */
  validate (value = this._value, next = (error) => !error) {
    let error

    if (_.isFunction(value)) {
      next = value
      value = this._value
    }

    if (_.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        this.validate(value[i], (err) => { error = err })
        if (error) break
      }

      return next(error)
    }

    for (let option in this.options) {
      let optionValue = this.options[option]
      let validator

      if (option === 'validate' && _.isFunction(optionValue)) {
        validator = optionValue
      } else if (_.isFunction(this.handlers.validators[option])) {
        validator = this.handlers.validators[option].bind(this, optionValue)
      } else {
        continue
      }

      let validation = validator(value, this)

      if (!validation.valid) {
        error = _.assign({
          name: option,
          param: this.name,
          value: value,
          [option]: optionValue
        }, validation)
        break
      }
    }

    return next(error)
  }

  _getType (value = this._value) {
    if (_.isNil(value)) {
      return String
    } else if (_.isNumber(value)) {
      return Number
    } else if (_.isBoolean(value)) {
      return Boolean
    } else if (_.isDate(value)) {
      return Date
    } else if (_.isRegExp(value)) {
      return RegExp
    } else if (_.isArray(value)) {
      this.option('multiple', true)
      return this._getType(value[0])
    } else {
      return String
    }
  }
}
