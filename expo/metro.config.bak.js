// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, './..');
const config = getDefaultConfig(projectRoot);
config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

const monorepoPackages = {
  share: path.resolve(monorepoRoot, 'share'),
  backend: path.resolve(monorepoRoot, 'backend'),
};
config.resolver.extraNodeModules = monorepoPackages;

module.exports = withNativeWind(config, { input: './global.css' });
