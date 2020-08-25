const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { compilerOptions } = require('./tsconfig.json');
module.exports = {
  roots: [
    '<rootDir>/src',
    '<rootDir>/tests/'
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testRegex: '/tests/.*\\.(test|spec)\\.tsx?$',
  // testRegex: '(/tests/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: [
    'ts',
    'js'
  ],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths , { prefix: '<rootDir>/' })
  // moduleNameMapper: {
  //   '^~/(.+)': '<rootDir>/src/$1'
  // }
}