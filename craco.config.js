const { webpackConfig } = require('@craco/craco');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Encontra o plugin do Workbox dentro da configuração do CRA
      const workboxPlugin = webpackConfig.plugins.find(
        (plugin) => plugin.constructor.name === 'GenerateSW'
      );

      if (workboxPlugin) {
        // Aumenta o limite para 10 MB (10 * 1024 * 1024)
        workboxPlugin.config.maximumFileSizeToCacheInBytes = 10485760;
      }

      return webpackConfig;
    },
  },
};