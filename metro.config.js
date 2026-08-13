const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('wasm');

config.transformer.minifierConfig = {
  ...config.transformer.minifierConfig,
  keep_classnames: true,
  keep_fnames: true,
};

module.exports = config;
