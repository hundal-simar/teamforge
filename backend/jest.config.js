export default {
  testEnvironment: 'node',
  transform: {},
  setupFilesAfterEnv: ['./src/tests/setup.js'],
  testTimeout: 15000,
  collectCoverageFrom: [
  "src/**/*.js",         
  "!src/**/index.js",     
  "!src/config/**"
]
};