import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  globalSetup: './src/jest-setup.ts',
  globalTeardown: './src/jest-teardown.ts'
};

export default config;