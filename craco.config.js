module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Procura por qualquer variação do plugin do Workbox dentro da build do CRA
      const workboxPlugin = webpackConfig.plugins.find(
        (plugin) => 
          plugin.constructor.name === 'GenerateSW' || 
          plugin.constructor.name === 'InjectManifest'
      );

      if (workboxPlugin) {
        // Altera o limite para 15 MB (15 * 1024 * 1024) para dar uma margem segura ao seu bundle
        workboxPlugin.config.maximumFileSizeToCacheInBytes = 15728640;
        console.log('✅ [CRACO] Limite do Workbox alterado com sucesso para 15MB.');
      } else {
        console.log('⚠️ [CRACO] Plugin do Workbox não foi localizado na configuração.');
      }

      return webpackConfig;
    },
  },
};