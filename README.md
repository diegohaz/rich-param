# rich-param

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coveralls Status][coveralls-image]][coveralls-url]
[![Dependency Status][depstat-image]][depstat-url]
[![Downloads][download-badge]][npm-url]

> An object with name and value which accepts pluggable methods as formatters or validators.

## Install

```sh
npm install rich-param
```

## Usage

### Basic
```js
import Param from 'rich-param'

// new Param(name, value, options)
const param = new Param('firstName', 'Jessica', { uppercase: true })

console.log(param.name) // firstName
console.log(param.value()) // JESSICA
```

### Setting and getting value
```js
console.log(param.value('pRIsCila')) // PRISCILA
```

### Setting and getting options
See [List of default options](#list-of-default-options)
```js
console.log(param.option('uppercase')) // true
console.log(param.option('uppercase', false)) // false

console.log(param.value('prisciLa')) // prisciLa
```

### Formatting the value
```js
param.option('format', (value, param) => `${param.name}: ${value}`)

console.log(param.value('PRISCILA')) // firstName: PRISCILA
```

### Validating the value
```js
param.option('validate', (value, param) => ({
  valid: value === 'Jessica',
  message: 'Jessica is the only valid name'
}))

param.value('Jessica')
console.log(param.validate()) // true

param.value('Priscila')
console.log(param.validate()) // false

// or get the error object
param.validate((err) => {
  console.log(err)
  /* {
    valid: false,
    name: 'validate',
    param: 'firstName',
    value: 'Priscila',
    message: 'Jessica is the only valid name'
  } */
})
```

### Validating using the built-in validators
See [List of default options](#list-of-default-options)
```js
param.option('required', true)
param.value('')

console.log(param.validate()) // false

// or get the error object
param.validate((err) => {
  console.log(err)
  /* {
    valid: false,
    name: 'required',
    required: true,
    param: 'firstName',
    value: '',
    message: 'firstName is required'
  } */
})
```

### Creating a custom formatter
```js
param.formatter('shout', (shout, value, param) => {
  if (shout && value) {
    value = value.toUpperCase() + '!'
  }
  return value
})

console.log(param.value('Jessica')) // Jessica

param.option('shout', true)

console.log(param.value('Jessica')) // JESSICA!
```

### Creating a custom validator
```js
param.validator('mustBeAShout', (mustBeAShout, value, param) => ({
  valid: !mustBeAShout || !value && value.toUpperCase() === value && value.indexOf('!') !== -1,
  message: 'THE VALUE MUST BE A SHOUT!'
}))

param.option('shout', false)

console.log(param.value('Jessica')) // Jessica
console.log(param.validate()) // true

param.option('mustBeAShout', true)

console.log(param.validate()) // false

param.option('shout', true)

console.log(param.value('Jessica')) // JESSICA!
console.log(param.validate()) // true
```

## Reference

### List of default options

Option | Type | Default value | Description
-------|------|---------------|-------------
default | Mixed | | Default param value
normalize | Boolean | `false` | Formats `Hey, jÉssiCa!` to `hey jessica`
lowercase | Boolean | `false` | Formats `HeLLo!` to `hello!`
uppercase | Boolean | `false` | Formats `HeLLo!` to `HELLO!`
trim | Boolean | `true` | Formats `  HeLLo  ! ` to `HeLLo  !`
required | Boolean | `false` | Invalidates empty values
min | Number | | Invalidates values lower than it
max | Number | | Invalidates values greater than it
minlength | Number | | Invalidates values with length lower than it
maxlength | Number | | Invalidates values with length greater than it
enum | Array | | Invalidates values which isn't in it
match | RegExp | | Invalidates values which doesn't pass the RegExp
multiple | Boolean | `false` | Make the value an array
separator | String | `,` | String to be found in the value to split into an array (if multiple = true)
format | Function | `(value, param) => value` | Function to be called with `param.value()`
validate | Function | `(value, param) => ({ valid: true })` | Function to be called with `param.validate()`


## License

MIT © [Diego Haz](http://github.com/diegohaz)

[npm-url]: https://npmjs.org/package/rich-param
[npm-image]: https://img.shields.io/npm/v/rich-param.svg?style=flat-square

[travis-url]: https://travis-ci.org/diegohaz/rich-param
[travis-image]: https://img.shields.io/travis/diegohaz/rich-param.svg?style=flat-square

[coveralls-url]: https://coveralls.io/r/diegohaz/rich-param
[coveralls-image]: https://img.shields.io/coveralls/diegohaz/rich-param.svg?style=flat-square

[depstat-url]: https://david-dm.org/diegohaz/rich-param
[depstat-image]: https://david-dm.org/diegohaz/rich-param.svg?style=flat-square

[download-badge]: http://img.shields.io/npm/dm/rich-param.svg?style=flat-square
