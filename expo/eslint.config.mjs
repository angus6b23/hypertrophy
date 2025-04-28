// eslint.config.js
import expoConfig from 'eslint-config-expo';
import { defineConfig } from 'eslint/config';

const config = defineConfig([
  expoConfig,
  // your other config
]);

export default config;
