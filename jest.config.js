module.exports = {
  preset: 'jest-expo',
  watchman: false,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};

